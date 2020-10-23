import { createAppMenu, IAppMenuElement } from '../../../UI/Toolbar/create'
import { IModuleConfig } from '../types'

export const ToolbarModule = ({ disposables }: IModuleConfig) => ({
	createCategory(config: {
		displayName: string
		displayIcon?: string
		onClick?: () => void
		elements?: IAppMenuElement[]
	}) {
		const toolbar = createAppMenu(config)
		disposables.push(toolbar)
		return toolbar
	},
})
