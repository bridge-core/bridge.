import { IAppMenu } from '../create'
import GoToFileWindow from '../../../../windows/GoToFileWindow'
import SnippetWindow from '../../../../windows/Snippets'
import PresetWindow from '../../../../windows/PresetWindow'

export const ToolMenu: IAppMenu = {
	displayName: 'Tools',
	displayIcon: 'mdi-wrench',
	elements: [
		{
			displayName: 'Presets',
			displayIcon: 'mdi-text-box-multiple-outline',
			onClick: () => new PresetWindow(),
		},
		{
			displayName: 'Snippets',
			displayIcon: 'mdi-attachment',
			keyBinding: {
				key: 'q',
				ctrlKey: true,
			},
			onClick: () => SnippetWindow.show(),
		},
		{
			displayName: 'Go to File',
			displayIcon: 'mdi-magnify',
			keyBinding: {
				key: 'o',
				ctrlKey: true,
				shiftKey: true,
			},
			onClick: () => GoToFileWindow.show(),
		},
	],
}
