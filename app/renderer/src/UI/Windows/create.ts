import { Component as VueComponent } from 'vue'
import Vue from 'vue'
import uuid from 'uuid/v4'

export const WINDOWS = Vue.observable({})
export function createWindow(
	vueComponent: VueComponent,
	state: { [key: string]: unknown } = {}
) {
	const windowUUID = uuid()
	const windowState: typeof state = Vue.observable({
		isVisible: false,
		shouldRender: false,
		...state,
	})
	Vue.set(WINDOWS, windowUUID, vueComponent)

	return {
		getState: () => windowState,
		close: () => {
			windowState.isVisible = false
			setTimeout(() => {
				windowState.shouldRender = false
			}, 600)
		},
		open: () => {
			windowState.shouldRender = true
			windowState.isVisible = true
		},
		dispose: () => Vue.delete(WINDOWS, windowUUID),
	}
}
