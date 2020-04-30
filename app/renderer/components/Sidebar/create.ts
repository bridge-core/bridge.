import { SidebarState } from './state'
import uuid from 'uuid/v4'
import Vue from 'vue'
import { IDisposable } from '../../src/Types/disposable'

export interface ISidebar {
	icon?: string
	displayName?: string
	componentName?: string

	onClick?: () => void
}

export interface ISidebarInstance extends IDisposable, ISidebar {
	readonly uuid: string
	readonly isSelected: boolean
	readonly opacity: number

	select: () => void
	toggle: () => void
}

/**
 * Creates a new notification
 * @param config
 */
export function createSidebar(config: ISidebar): ISidebarInstance {
	let sidebarUUID = uuid()

	const sidebar = {
		...config,
		get uuid() {
			return sidebarUUID
		},
		get isSelected() {
			return SidebarState.currentState === sidebarUUID
		},
		get opacity() {
			return this.isSelected ? 1 : 0.25
		},
		dispose: () => {
			Vue.delete(SidebarState.sidebarElements, sidebarUUID)
		},

		select() {
			SidebarState.currentState = sidebarUUID
		},
		toggle() {
			if (this.isSelected) SidebarState.currentState = null
			else this.select()
		},
	}

	Vue.set(SidebarState.sidebarElements, sidebarUUID, sidebar)
	return sidebar
}
