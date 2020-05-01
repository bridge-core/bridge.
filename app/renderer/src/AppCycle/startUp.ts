import SETTINGS from '../../store/Settings'
import UpdateWindow from '../../windows/NewUpdateWindow'
import DiscordWindow from '../../windows/Discord'
import { shell } from 'electron'
import fetchLatestJson from '../../src/Utilities/FetchLatestJson'
import { CONNECTION } from '../../src/Utilities/ConnectionStatus'
import { setupDefaultMenus } from '../UI/Toolbar/setupDefaults'
import { createNotification } from '../UI/Footer/create'
import './DropFile'

export default async function startUp() {
	SETTINGS.setup()
	// Start listening for online and offline events
	CONNECTION.startListening()

	setupDefaultMenus()
	if (process.env.NODE_ENV !== 'development') {
		let discord_msg = createNotification({
			icon: 'mdi-discord',
			message: 'Discord Server',
			color: '#7289DA',
			textColor: 'white',
			onClick: () => {
				new DiscordWindow(
					() => {
						shell.openExternal('https://discord.gg/jj2PmqU')
					},
					() => {
						discord_msg.dispose()
					}
				)
			},
		})
	}

	// Fetch the latest json/version data
	let update_data = await fetchLatestJson()

	if (update_data.update_available) {
		// If there's an update, notify the user
		createNotification({
			icon: 'mdi-update',
			message: 'Update Available',
			textColor: 'white',
			onClick: () => {
				new UpdateWindow(update_data)
			},
		})
	}
}
