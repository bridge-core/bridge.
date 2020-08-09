import { IAppMenu } from '../create'
import { ipcRenderer } from 'electron'
import Provider from '../../../autoCompletions/Provider'
import { trigger } from '../../../AppCycle/EventSystem'
import PluginLoader from '../../../plugins/PluginLoader'
import Store from '../../../../store/index'
import ThemeManager from '../../../editor/Themes/ThemeManager'
import LoadingWindow from '../../../../windows/LoadingWindow'

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
			onClick: async () => {
				const lw = new LoadingWindow()

				trigger('bridge:scriptRunner.resetCaches')
				Provider.loadAssets()
				ThemeManager.reloadDefaultThemes()
				await PluginLoader.loadPlugins()

				lw.close()
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
