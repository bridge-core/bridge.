export interface SidebarElement {
	title: string
	icon: string
	opacity?: number
	color?: string
	is_selected?: boolean
	action?: () => any
}

export interface WindowDefinition {
	display_name?: string
	is_visible?: boolean
	id?: string
	sidebar?: SidebarElement[]
	content?: WindowContent[]
	actions?: WindowContent[]
	options?: WindowOptions
	onClose?: (...args: any[]) => any
}

export interface WindowContent {
	[x: string]: any
}

export interface WindowOptions {
	is_persistent?: boolean
	[x: string]: any
}
