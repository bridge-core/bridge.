import { INewVersionRes } from '../src/Utilities/fetchUpdate'
import { Marked } from '@ts-stack/markdown'
import { WEB_APP_DATA } from '../src/constants'
import ContentWindow from '../src/UI/Windows/Common/Content'
import updateApp from '../src/Utilities/updateApp'

export default class UpdateWindow extends ContentWindow {
	content: any
	constructor({
		description,
		latest_version,
		downloads,
		latest_version_name,
		url,
	}: INewVersionRes) {
		// Check if there's an update name, if not, add a generic "update available"
		if (!latest_version_name.includes('-'))
			latest_version_name = latest_version.concat(' - Update Available')

		// Create the window
		super(
			{
				is_visible: true,
				options: {
					height: undefined,
					is_frameless: true,
					is_maximizable: false,
				},
				actions: [
					{
						text: 'bridge.',
						color: 'grey',
					},
					{
						type: 'space',
					},
					{
						type: 'button',
						text: 'Later',
						is_rounded: false,
						action: () => {
							this.close()
						},
					},
					{
						type: 'button',
						icon: 'mdi-download',
						text: 'Download!',
						is_rounded: false,
						color: 'primary',
						action: () => {
							this.close()
							updateApp(url)
						},
					},
				],
			},
			'update_app_window.'
		)

		this.content = [
			{
				type: 'header',
				text: latest_version_name,
			},
			{
				type: 'divider',
			},
			{
				type: 'img',
				src: WEB_APP_DATA + 'update_splash.png',
				height: '250px',
			},
			{
				type: 'divider',
			},
			{
				type: 'html-text',
				text: `<br>${Marked.parse(description)}`,
			},
			{
				text: `\nDownloads: ${downloads}\n\n`,
			},
		]
		this.update({ content: this.content })
	}
}
