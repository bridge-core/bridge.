import { createNotification } from '../../Footer/create'
import { createConfirmWindow } from '../Common/CommonDefinitions'
import { createWindow } from '../create'
import MigrationWindowComponent from './Main.vue'

export function createMigrationPromptWindow() {
	createConfirmWindow(
		'bridge. v2 is now available! To begin migrating to bridge. v2, select the "Continue" option below.',
		'Continue',
		'Discard',
		() => MigrationWindow.open(),
		() => createMigrationPromptNotification()
	)
}
export function createMigrationPromptNotification() {
	let migrationPrompt = createNotification({
		icon: 'mdi-update',
		message: 'bridge. v2',
		textColor: 'white',
		disposeOnMiddleClick: false,
		onClick: () => {
			createMigrationPromptWindow()
			migrationPrompt.dispose()
		},
	})
}

export const MigrationWindow = createWindow(MigrationWindowComponent, {
	selectedProjects: [],
	availableProjects: [],
	projectPath: undefined,
})
