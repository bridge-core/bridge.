/**
 * Reactive vue state for the Sidebar
 */

import Vue from 'vue'
import { ISidebarInstance } from './create'

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
	Object.values(SidebarState.sidebarElements)
		.find(({ id }) => id === findId)
		?.select()
}

export function getSelected() {
	return SidebarState.sidebarElements[SidebarState.currentState]
}
