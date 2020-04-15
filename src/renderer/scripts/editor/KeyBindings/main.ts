import { IDisposable } from '../../Types/disposable'
import { platform } from 'os'

const IGNORE_KEYS = ['Control', 'Alt', 'Meta']
const KEYMAP = new Map<string, () => void>()

export interface IKeyBinding {
	key: string
	shiftKey?: boolean
	ctrlKey?: boolean
	altKey?: boolean
	metaKey?: boolean
}

export function setupKeyBindings() {
	document.addEventListener('keyup', event => {
		const { key, ctrlKey, altKey, metaKey } = event
		if (IGNORE_KEYS.includes(key)) return

		let action = KEYMAP.get(
			getStrKeyCode({
				key,
				ctrlKey,
				altKey,
				metaKey,
				shiftKey: key.toUpperCase() === key,
			})
		)

		if (action) {
			event.preventDefault()
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
	if (metaKey) code = 'Meta + ' + code
	if (shiftKey) code = 'Shift + ' + code
	if (altKey) code = 'Alt + ' + code
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

	KEYMAP.set(keyCode, action)

	return {
		dispose: () => KEYMAP.delete(keyCode),
	}
}
