import { IAppMenu } from '../create'
import { ipcRenderer } from 'electron'
import Provider from '../../../autoCompletions/Provider'
import { trigger } from '../../../AppCycle/EventSystem'
import EventBus from '../../../EventBus'

export const DevMenu: IAppMenu = {
	displayName: 'Development',
	displayIcon: 'mdi-console-line',
	elements: [
		{
			displayName: 'Reload Browser Window',
			displayIcon: 'mdi-reload',
			keyBinding: {
				key: 'r',
				ctrlKey: true,
			},
			onClick: () => {
				ipcRenderer.send('bridge:reloadWindow')
			},
		},
		{
			displayName: 'Reload Editor Data',
			displayIcon: 'mdi-reload',
			keyBinding: {
				key: 'r',
				shiftKey: true,
				ctrlKey: true,
			},
			onClick: () => {
				trigger('bridge:scriptRunner.resetCaches')
				EventBus.trigger('bridge:refreshExplorer')
				Provider.loadAssets()
			},
		},
		{
			displayName: 'Developer Tools',
			displayIcon: 'mdi-console',
			keyBinding: {
				key: 'i',
				shiftKey: true,
				ctrlKey: true,
			},
			onClick: () => {
				ipcRenderer.send('toggleDevTools')
			},
		},
	],
}
