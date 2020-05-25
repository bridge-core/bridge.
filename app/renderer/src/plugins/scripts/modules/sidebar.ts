import { IModuleConfig } from '../types'
import { createSidebar, ISidebarInstance } from '../../../UI/Sidebar/create'
import { selectSidebar, getSelected } from '../../../UI/Sidebar/state'
import { on } from '../../../AppCycle/EventSystem'

export const SidebarModule = ({ disposables }: IModuleConfig) => ({
	create(config: {
		id?: string
		displayName: string
		component: string
		icon: string
	}) {
		const sidebar = createSidebar(config)
		disposables.push(sidebar)
		return sidebar
	},

	getSelected,
	onChange(
		cb: (
			prevSidebar: ISidebarInstance,
			newSidebar: ISidebarInstance
		) => void
	) {
		disposables.push(on('bridge:toggledSidebar', cb))
	},
	select: selectSidebar,
})
