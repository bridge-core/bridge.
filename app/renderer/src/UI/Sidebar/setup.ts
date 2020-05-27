import { createSidebar, ISidebarInstance } from './create'

let defaultSidebar: ISidebarInstance
export function getDefaultSidebar() {
	return defaultSidebar
}

export function setupSidebar() {
	defaultSidebar = createSidebar({
		id: 'bpExplorer',
		displayName: 'Behavior Pack',
		icon: 'mdi-folder',
		component: 'BehaviorPack',
	}).select()

	createSidebar({
		id: 'rpExplorer',
		displayName: 'Resource Pack',
		icon: 'mdi-file-image',
		component: 'ResourcePack',
	})

	createSidebar({
		id: 'vanillaPacks',
		displayName: 'Vanilla Packs',
		icon: 'mdi-minecraft',
		component: 'VanillaPacks',
	})
	createSidebar({
		id: 'documentation',
		displayName: 'Documentation',
		icon: 'mdi-book-open-page-variant',
		component: 'Documentation',
	})
	createSidebar({
		id: 'debugLog',
		displayName: 'Debug Log',
		icon: 'mdi-console',
		component: 'DebugLog',
	})
	createSidebar({
		id: 'extensions',
		displayName: 'Extensions',
		icon: 'mdi-puzzle',
		component: 'Extensions',
	})
}
