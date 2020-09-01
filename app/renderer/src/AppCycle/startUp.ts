import SETTINGS from '../../store/Settings'
import UpdateWindow from '../../windows/NewUpdateWindow'
import { fetchLatestJson } from '../../src/Utilities/updateApp'
import { CONNECTION } from '../../src/Utilities/ConnectionStatus'
import { setupDefaultMenus } from '../UI/Toolbar/setupDefaults'
import { createNotification } from '../UI/Footer/create'
import { shell, remote } from 'electron'
import { Discord as DiscordWindow } from '../UI/Windows/Discord/definition'
import './DropFile'
import './ResizeWatcher'
import './Errors'
import Store from '../../store/index'

export default async function startUp() {
	SETTINGS.setup()
	// Start listening for online and offline events
	CONNECTION.startListening()

	setupDefaultMenus()
	if (process.env.NODE_ENV !== 'development') {
		let discordMsg = createNotification({
			icon: 'mdi-discord',
			message: 'Discord Server',
			color: '#7289DA',
			textColor: 'white',
			onClick: () => {
				DiscordWindow.open()
				discordMsg.dispose()
			},
		})
	}

	createAppUpdateNotification()

	if (process.env.NODE_ENV !== 'development') {
		let getting_started = createNotification({
			icon: 'mdi-help-circle-outline',
			message: 'Getting Started',
			textColor: 'white',
			onClick: () => {
				shell.openExternal(
					'https://github.com/bridge-core/bridge./blob/master/GETTING_STARTED.md'
				)
				getting_started.dispose()
			},
		})
	}
	if (Store.state.Settings.open_in_fullscreen) {
		remote.getCurrentWindow().maximize()
	}
}

export function createAppUpdateNotification() {
	// Fetch the latest json/version data
	fetchLatestJson().then(updateData => {
		if (updateData.update_available) {
			// If there's an update, notify the user
			const notification = createNotification({
				icon: 'mdi-update',
				message: 'Update Available',
				textColor: 'white',
				onClick: () => {
					new UpdateWindow(updateData, notification)
				},
			})
		}
	})
}
