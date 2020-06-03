import { IAppMenu } from '../create'
import CreateFileWindow from '../../../../windows/CreateFile'
import InformationWindow from '../../../UI/Windows/Common/Information'
import Store from '../../../../store/index'
import { ipcRenderer } from 'electron'
import TabSystem from '../../../TabSystem'
import SettingsWindow from '../../../../windows/Settings'
import ExtensionBrowser from '../../../../windows/Extensions/Browser'
import ImportObjWindow from '../../../../windows/ImportObj'
import LoadingWindow from '../../../../windows/LoadingWindow'
import FileSystem from '../../../FileSystem'
import { ImportFileMap } from '../../../plugins/scripts/modules/importFiles'

export const FileMenu: IAppMenu = {
	displayName: 'File',
	displayIcon: 'mdi-file-outline',
	elements: [
		{
			displayName: 'New File',
			displayIcon: 'mdi-file-plus',
			keyBinding: {
				key: 'n',
				ctrlKey: true,
			},
			onClick: () => {
				if (Store.state.Explorer.project.explorer)
					new CreateFileWindow(undefined, false)
				else
					new InformationWindow(
						'Information',
						'You need to create a project before you can create files.'
					)
			},
		},
		{
			displayName: 'Import',
			displayIcon: 'mdi-import',
			elements: () => [
				{
					displayName: 'Open File',
					displayIcon: 'mdi-file-upload-outline',
					keyBinding: {
						key: 'o',
						ctrlKey: true,
					},
					onClick: async () => {
						const lw = new LoadingWindow()
						;(
							await ipcRenderer.invoke('openFileDialog', {
								properties: ['multiSelections'],
							})
						).forEach((filePath: string) =>
							FileSystem.open(filePath)
						)

						lw.close()
					},
				},
				{
					displayName: 'Import OBJ Model',
					displayIcon: 'mdi-video-3d',
					onClick: () => new ImportObjWindow(),
				},
				...ImportFileMap.values(),
			],
		},
		{
			displayName: 'Save File',
			displayIcon: 'mdi-file-download-outline',
			keyBinding: {
				key: 's',
				ctrlKey: true,
			},
			onClick: () => TabSystem.saveCurrent(),
		},
		{
			displayName: 'Save As...',
			displayIcon: 'mdi-file-export-outline',
			keyBinding: {
				key: 's',
				shiftKey: true,
				ctrlKey: true,
			},
			onClick: () => TabSystem.saveCurrentAs(),
		},
		{
			displayName: 'Save All',
			displayIcon: 'mdi-file-sync-outline',
			keyBinding: {
				key: 's',
				altKey: true,
				ctrlKey: true,
			},
			onClick: () => TabSystem.saveAll(),
		},
		{
			displayName: 'Close Editor',
			displayIcon: 'mdi-close',
			keyBinding: {
				key: 'w',
				ctrlKey: true,
			},
			onClick: () => TabSystem.closeSelected(),
		},
		{
			displayName: 'Preferences',
			displayIcon: 'mdi-tune',
			elements: [
				{
					displayName: 'Settings',
					displayIcon: 'mdi-cog',
					onClick: () => new SettingsWindow(),
				},
				{
					displayName: 'Extensions',
					displayIcon: 'mdi-puzzle',
					onClick: () => new ExtensionBrowser(),
				},
			],
		},
	],
}
