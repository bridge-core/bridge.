import SETTINGS from '../../store/Settings'
import DiscordWindow from '../../windows/Discord'
import { shell } from 'electron'
import { runUpdateCheck } from '../Utilities/fetchUpdate'
import { CONNECTION } from '../../src/Utilities/ConnectionStatus'
import { setupDefaultMenus } from '../UI/Toolbar/setupDefaults'
import { createNotification } from '../UI/Footer/create'
import './DropFile'
import './ResizeWatcher'
import './Errors'

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

	runUpdateCheck()
}
