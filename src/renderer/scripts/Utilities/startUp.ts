import SETTINGS from '../../store/Settings'
import UpdateWindow from '../../windows/NewUpdateWindow'
import Notification from '../Notification'
import DiscordWindow from '../../windows/Discord'
import { shell } from 'electron'
import fetchLatestJson from './FetchLatestJson'
import { CONNECTION } from './ConnectionStatus'
import { browser_window } from '../constants'
import { isNullOrUndefined } from 'util'

export default async function startUp() {
	SETTINGS.setup()

	// load and set the last window position
	try {
		let data = SETTINGS.load()
		if (isNullOrUndefined(data.pos_x) && isNullOrUndefined(data.pos_y)) {
			browser_window.setPosition(0, 0)
		} else {
			browser_window.setPosition(data.pos_x, data.pos_y)
		}
	} catch (e) {
		// not too bad if fails
		console.log(e)
	}
	// start listening for online and offline events
	CONNECTION.startListening()

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
	discord_msg.send()

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
	if (update_data.update_available || true) update_msg.send()

	//listener for saving the window position on bridge. closing
	window.addEventListener('beforeunload', () => {
		let data = SETTINGS.load(),
			pos = browser_window.getPosition()
		data.pos_x = pos[0]
		data.pos_y = pos[1]
		SETTINGS.save(data)
	})
}
