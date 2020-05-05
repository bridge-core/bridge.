import { createSidebar } from './create'

export function setupSidebar() {
	createSidebar({
		displayName: 'Behavior Pack',
		icon: 'mdi-folder',
		componentName: 'BehaviorPack',
	}).select()

	createSidebar({
		displayName: 'Resource Pack',
		icon: 'mdi-file-image',
		componentName: 'ResourcePack',
	})

	createSidebar({
		displayName: 'Vanilla Packs',
		icon: 'mdi-minecraft',
		componentName: 'VanillaPacks',
	})
	createSidebar({
		displayName: 'Documentation',
		icon: 'mdi-book-open-page-variant',
		componentName: 'Documentation',
	})
	createSidebar({
		displayName: 'Debug Log',
		icon: 'mdi-console',
		componentName: 'DebugLog',
	})
	createSidebar({
		displayName: 'Extensions',
		icon: 'mdi-puzzle',
		componentName: 'Extensions',
	})
}
