import TabWindow from '../scripts/commonWindows/TabWindow'
import { shell } from 'electron'
import { APP_VERSION } from '../scripts/constants'

interface CreatorLinkConfig {
	type?: 'icon-button'
	color?: string
	text?: string
	link?: string
	is_flat?: boolean
	action?: () => any
}

class Creator {
	private type = 'container'
	private content: any[]

	constructor(content: string, creator: string, links: CreatorLinkConfig[]) {
		this.content = [
			{
				type: 'header',
				text: `\n${content}: ${creator}`,
			},
			...links.map(({ link, ...other }) => {
				return {
					type: 'icon-button',
					is_flat: true,
					...other,
					action: () => {
						shell.openExternal(link)
					},
				}
			}),
		]
	}
}
class Link {
	private type = 'container'
	private content: any[]

	constructor(content: string, link_name: string, link: string) {
		this.content = [
			{
				text: `${content}${content ? ' ' : ''}`,
			},
			{
				color: 'grey',
				text: link_name,
				action: () => shell.openExternal(link),
			},
		]
	}
}

export default class AboutWindow extends TabWindow {
	constructor() {
		super('About', { is_persistent: false }, 'bridge.core.credits_window.')

		this.addTab({
			sidebar_element: {
				icon: 'mdi-code-braces',
				title: 'General',
			},
			content: [
				{
					type: 'header',
					text: `\nYou are running bridge. ${APP_VERSION}\n\n`,
				},
				{
					type: 'divider',
				},
				new Creator('Developer', 'solvedDev', [
					{
						color: 'info',
						text: 'mdi-twitter',
						link: 'https://twitter.com/solvedDev',
					},
					{
						color: 'black',
						text: 'mdi-github-circle',
						link: 'https://github.com/solvedDev',
					},
				]),
				{
					type: 'divider',
				},
				new Creator('Developer', 'Monte Hellawell', [
					{
						color: 'info',
						text: 'mdi-twitter',
						link: 'https://twitter.com/montudor',
					},
					{
						color: 'black',
						text: 'mdi-github-circle',
						link: 'https://github.com/montudor',
					},
				]),
				{
					type: 'divider',
				},
				new Creator('Developer', 'Enderzombi102', [
					{
						color: 'black',
						text: 'mdi-github-circle',
						link: 'https://github.com/ENDERZOMBI102',
					},
				]),
				{
					type: 'divider',
				},
				new Creator('Contributor', 'BSavage81', [
					{
						color: 'info',
						text: 'mdi-twitter',
						link: 'https://twitter.com/BSavage_81',
					},
				]),
				{
					type: 'divider',
				},
				new Creator('Contributor', 'BD64 | Brandon', [
					{
						color: 'info',
						text: 'mdi-twitter',
						link: 'https://twitter.com/BrandonDyer64',
					},
					{
						color: 'black',
						text: 'mdi-github-circle',
						link: 'https://github.com/BrandonDyer64',
					},
				]),
				{
					type: 'divider',
				},
				new Creator('Contributor', 'CodeHZ', [
					{
						color: 'black',
						text: 'mdi-github-circle',
						link: 'https://github.com/codehz',
					},
				]),
				{
					type: 'divider',
				},
				new Creator('Contributor', 'TheDestruc7i0n', [
					{
						color: 'info',
						text: 'mdi-twitter',
						link: 'https://twitter.com/TheDestruc7i0n',
					},
					{
						color: 'black',
						text: 'mdi-github-circle',
						link: 'https://github.com/destruc7i0n',
					},
				]),
			],
		})
		this.addTab({
			sidebar_element: {
				icon: 'mdi-file-image',
				title: 'Assets',
			},
			content: [
				new Creator('Logo', 'Matteo Simonetti', [
					{
						color: 'info',
						text: 'mdi-twitter',
						link: 'https://twitter.com/lKanno_',
					},
				]),
				{
					type: 'divider',
				},
			],
		})
		this.addTab({
			sidebar_element: {
				icon: 'mdi-open-in-new',
				title: 'Links',
			},
			content: [
				new Link(
					'bridge. README: ',
					'GitHub',
					'https://github.com/solvedDev/bridge./'
				),
				new Link('Bedrock ', 'Documentation', 'https://bedrock.dev/'),
				new Link(
					'',
					'Vanilla Behavior Pack',
					'https://aka.ms/MinecraftBetaBehaviors/'
				),
				new Link(
					'',
					'Vanilla Resource Pack',
					'http://aka.ms/MinecraftBetaResources'
				),
			],
		})

		this.update()
	}
}
