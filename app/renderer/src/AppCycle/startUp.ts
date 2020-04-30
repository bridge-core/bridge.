import SETTINGS from '../../store/Settings'
import UpdateWindow from '../../windows/NewUpdateWindow'
import Notification from '../Notification'
import DiscordWindow from '../../windows/Discord'
import { shell } from 'electron'
import fetchLatestJson from '../Utilities/FetchLatestJson'
import { CONNECTION } from '../Utilities/ConnectionStatus'
import { setupDefaultMenus } from '../../components/Toolbar/setupDefaults'

export default async function startUp() {
	SETTINGS.setup()
	// Start listening for online and offline events
	CONNECTION.startListening()

	setupDefaultMenus()

	let discord_msg = new Notification({
		display_icon: 'mdi-discord',
		display_name: 'Discord Server',
		color: '#7289DA',
		text_color: 'white',
		action: () => {
			new DiscordWindow(
				() => {
					shell.openExternal('https://discord.gg/jj2PmqU')
				},
				() => {
					discord_msg.remove()
				}
			)
		},
	})
	if (process.env.NODE_ENV !== 'development') discord_msg.send()

	// Fetch the latest json/version data
	let update_data = await fetchLatestJson()

	let update_msg = new Notification({
		display_icon: 'mdi-update',
		display_name: 'Update Available',
		text_color: 'white',
		action: () => {
			new UpdateWindow(update_data)
		},
	})
	// If there's an update, notify the user
	if (update_data.update_available) update_msg.send()
}
