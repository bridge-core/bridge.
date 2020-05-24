import { createSidebar, ISidebarInstance } from './create'

let defaultSidebar: ISidebarInstance
export function getDefaultSidebar() {
	return defaultSidebar
}

export function setupSidebar() {
	defaultSidebar = createSidebar({
		displayName: 'Behavior Pack',
		icon: 'mdi-folder',
		component: 'BehaviorPack',
	}).select()

	createSidebar({
		displayName: 'Resource Pack',
		icon: 'mdi-file-image',
		component: 'ResourcePack',
	})

	createSidebar({
		displayName: 'Vanilla Packs',
		icon: 'mdi-minecraft',
		component: 'VanillaPacks',
	})
	createSidebar({
		displayName: 'Documentation',
		icon: 'mdi-book-open-page-variant',
		component: 'Documentation',
	})
	createSidebar({
		displayName: 'Debug Log',
		icon: 'mdi-console',
		component: 'DebugLog',
	})
	createSidebar({
		displayName: 'Extensions',
		icon: 'mdi-puzzle',
		component: 'Extensions',
	})
}
