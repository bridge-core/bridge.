import { IModuleConfig } from '../types'
import BaseWindow from '../../../UI/Windows/Layout/Base.vue'

export const UIModule = ({ uiStore }: IModuleConfig) => ({
	...uiStore?.UI,
	BuiltIn: {
		BaseWindow,
	},
})
