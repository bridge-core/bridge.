import { IAppMenu } from '../create'
import AboutWindow from '../../../../windows/About'
import { shell } from 'electron'

export const HelpMenu: IAppMenu = {
	displayName: 'Help',
	displayIcon: 'mdi-help',
	elements: [
		{
			displayName: 'About',
			displayIcon: 'mdi-information-outline',
			onClick: () => new AboutWindow(),
		},
		{
			displayName: 'Releases',
			displayIcon: 'mdi-alert-decagram',
			onClick: () =>
				shell.openExternal(
					'https://github.com/solvedDev/bridge./releases'
				),
		},
		{
			displayName: 'Bug Reports',
			displayIcon: 'mdi-bug-outline',
			onClick: () =>
				shell.openExternal(
					'https://github.com/solvedDev/bridge./issues/new/choose'
				),
		},
		{
			displayName: 'Plugin API',
			displayIcon: 'mdi-puzzle',
			onClick: () =>
				shell.openExternal(
					'https://github.com/solvedDev/bridge./blob/master/plugin_docs/main.md'
				),
		},
		{
			displayName: 'Getting Started',
			displayIcon: 'mdi-help-circle-outline',
			onClick: () =>
				shell.openExternal(
					'https://github.com/bridge-core/bridge./blob/master/GETTING_STARTED.md'
				),
		},
		{
			displayName: 'FAQ',
			displayIcon: 'mdi-frequently-asked-questions',
			onClick: () =>
				shell.openExternal(
					'https://github.com/bridge-core/bridge./blob/master/FAQ.md'
				),
		},
	],
}
