/**
 * Reactive vue state for the Sidebar
 */

import Vue from 'vue'
import { ISidebarInstance } from './create'
import { trigger } from '../../AppCycle/EventSystem'

export interface ISidebarState {
	currentState: string | null
	sidebarElements: {
		[uuid: string]: ISidebarInstance
	}
}

export const SidebarState: ISidebarState = Vue.observable({
	currentState: null,
	sidebarElements: {},
})

export function selectSidebar(findId: string) {
	const sidebar = Object.values(SidebarState.sidebarElements).find(
		({ id }) => id === findId
	)

	if (sidebar && sidebar !== getSelected()) {
		trigger('bridge:toggledSidebar', getSelected(), sidebar.select(), false)
	}
}

export function getSelected() {
	return SidebarState.sidebarElements[SidebarState.currentState]
}
