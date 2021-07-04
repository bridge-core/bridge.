import { createConfirmWindow } from '../Common/CommonDefinitions'
import { createWindow } from '../create'
import MigrationWindowComponent from './Main.vue'

export function createMigrationPromptWindow() {
	createConfirmWindow(
		'bridge. v2 is now available! To begin migrating to bridge. v2, select the "Continue" option below.',
		'Continue',
		'Later',
		() => MigrationWindow.open(),
		() => {}
	)
}

export const MigrationWindow = createWindow(MigrationWindowComponent, {
	selectedProjects: [],
	availableProjects: [],
	projectPath: undefined,
	projectsCreated: false,
})
