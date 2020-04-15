import { AppMenu } from './store'
import uuid from 'uuid/v4'
import Vue from 'vue'
import { IDisposable } from '../Types/disposable'
import { addKeyBinding, IKeyBinding } from '../editor/KeyBindings/main'

export interface IAppMenu {
	displayName: string
	displayIcon?: string
	onClick?: () => void
	elements?: IAppMenuElement[]
}
export interface IAppMenuElement {
	isHidden?: boolean
	displayName: string
	displayIcon?: string
	elements?: IAppMenuElement[]
	keyBinding?: IKeyBinding
	onClick?: () => void
}

/**
 * Adds new entry to the app menu
 * @param config
 */
export function createAppMenu(config: IAppMenu): IDisposable {
	let appMenuUUID = uuid()
	Vue.set(AppMenu, appMenuUUID, config)

	//Configure keyBindings
	let disposables = registerKeyBindings(config.elements ?? [])

	return {
		dispose: () => {
			Vue.delete(AppMenu, appMenuUUID)
			disposables.forEach(disposable => disposable.dispose())
		},
	}
}

function registerKeyBindings(elements: IAppMenuElement[]) {
	let disposables: IDisposable[] = []

	elements.forEach(({ keyBinding, onClick, elements }) => {
		if (keyBinding && onClick)
			disposables.push(addKeyBinding(keyBinding, onClick))
		else if (elements) disposables.push(...registerKeyBindings(elements))
	})

	return disposables
}
