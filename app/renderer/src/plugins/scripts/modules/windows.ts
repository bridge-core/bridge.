import { IModuleConfig } from '../types'
import { createInformationWindow } from '../../../UI/Windows/Common/CommonDefinitions'

export const WindowModule = ({}: IModuleConfig) => ({
	createInformationWindow: (displayName: string, displayContent: string) =>
		createInformationWindow(displayName, displayContent),
})
