import { SidebarState, getSelected } from './state'
import uuid from 'uuid/v4'
import Vue from 'vue'
import { IDisposable } from '../../Types/disposable'
import { trigger } from '../../AppCycle/EventSystem'
import { getDefaultSidebar } from './setup'

export interface ISidebar {
	id?: string
	icon?: string
	displayName?: string
	component?: string

	onClick?: () => void
}

export interface ISidebarInstance extends IDisposable, ISidebar {
	readonly uuid: string
	readonly isSelected: boolean
	readonly opacity: number

	select: () => ISidebarInstance
	toggle: () => void
}

/**
 * Creates a new sidebar
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
		get opacity(): number {
			return this.isSelected ? 1 : 0.25
		},
		dispose() {
			if (this.isSelected) getDefaultSidebar().select()
			Vue.delete(SidebarState.sidebarElements, sidebarUUID)
		},

		select() {
			const prevSelected = getSelected()
			SidebarState.currentState = sidebarUUID

			if (prevSelected !== this)
				trigger('bridge:toggledSidebar', prevSelected, this)
			return this
		},
		toggle() {
			if (this.isSelected) {
				trigger('bridge:onSidebarVisibilityChange', false)
				SidebarState.currentState = null

				trigger('bridge:toggledSidebar', this, null)
			} else {
				if (SidebarState.currentState === null)
					trigger('bridge:onSidebarVisibilityChange', true)
				this.select()
			}
			return this
		},
	}

	Vue.set(SidebarState.sidebarElements, sidebarUUID, sidebar)
	return sidebar
}
