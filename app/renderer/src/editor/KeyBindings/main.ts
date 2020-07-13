import { IDisposable } from '../../Types/disposable'
import { platform } from 'os'

const IGNORE_KEYS = ['Control', 'Alt', 'Meta']
const KEYMAP = new Map<string, IKeyBindingData>()

export interface IKeyBindingData {
	prevent?: (element: HTMLElement) => boolean
	action: () => void
}
export interface IKeyBinding {
	key: string
	shiftKey?: boolean
	ctrlKey?: boolean
	altKey?: boolean
	metaKey?: boolean
	prevent?: (element: HTMLElement) => boolean
}

let lastTimeStamp = 0
export function setupKeyBindings() {
	document.addEventListener('keydown', event => {
		const { key, ctrlKey, altKey, metaKey, shiftKey } = event
		if (IGNORE_KEYS.includes(key)) return

		const { action, prevent } =
			KEYMAP.get(
				getStrKeyCode({
					key,
					ctrlKey: platform() === 'darwin' ? metaKey : ctrlKey,
					altKey,
					metaKey: platform() === 'darwin' ? ctrlKey : metaKey,
					shiftKey,
				})
			) ?? {}

		if (action && lastTimeStamp + 500 < Date.now()) {
			if (prevent?.(<HTMLElement>event.target)) return
			lastTimeStamp = Date.now()
			event.preventDefault()
			event.stopImmediatePropagation()
			action()
		}
	})
}

export function fromStrKeyCode(keyCode: string) {
	let parts = keyCode.split(' + ')
	let keyBinding: IKeyBinding = { key: '' }

	parts.forEach(p => {
		switch (p.toLowerCase()) {
			case 'ctrl':
			case 'cmd':
				keyBinding.ctrlKey = true
			case 'alt':
				keyBinding.altKey = true
			case 'shift':
				keyBinding.shiftKey = true
			case 'meta':
				keyBinding.metaKey = true
			default:
				keyBinding.key = p.toLowerCase()
		}
	})

	return keyBinding
}

export function getStrKeyCode({
	key,
	ctrlKey,
	altKey,
	shiftKey,
	metaKey,
}: IKeyBinding) {
	let code = key.toUpperCase()
	if (shiftKey) code = 'Shift + ' + code
	if (altKey) code = 'Alt + ' + code
	if (metaKey) {
		if (platform() === 'darwin') code = 'Ctrl + ' + code
		else code = 'Meta + ' + code
	}
	if (ctrlKey) {
		if (platform() === 'darwin') code = 'Cmd + ' + code
		else code = 'Ctrl + ' + code
	}

	return code
}

export function addKeyBinding(
	keyBinding: IKeyBinding,
	action: () => void
): IDisposable {
	let keyCode = getStrKeyCode(keyBinding)

	if (KEYMAP.has(keyCode)) {
		throw new Error(`KeyBinding with keyCode "${keyCode}" already exists!`)
	}

	const { prevent } = keyBinding
	KEYMAP.set(keyCode, { action, prevent })

	return {
		dispose: () => KEYMAP.delete(keyCode),
	}
}
