import { IModuleConfig } from '../types'
import {
	createInformationWindow,
	createInputWindow,
} from '../../../UI/Windows/Common/CommonDefinitions'
import { createWindow } from '../../../UI/Windows/create'
import { Component as VueComponent } from 'vue'

export const WindowModule = ({}: IModuleConfig) => ({
	createWindow: (
		vueComponent: VueComponent,
		state: Record<string, unknown>
	) => createWindow(vueComponent, state),
	createInformationWindow: (displayName: string, displayContent: string) =>
		createInformationWindow(displayName, displayContent),
	createInputWindow: (
		displayName: string,
		inputLabel: string,
		onConfirm: (input: string) => void
	) => createInputWindow(displayName, inputLabel, onConfirm),
})
