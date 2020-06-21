import ListView from './ListView'
import Session, {
	tag,
	download
} from './Common'
import {
	greaterThan
} from '../../src/Utilities/VersionUtils'

class DownloadButton {
	type = 'button'
	icon = 'mdi-download'
	text = undefined
	color = 'primary'
	isGlobalInstall = false
	constructor(parent, action, disabled, isInstalled, isUpdate, pluginPath, text) {
		this.is_disabled = disabled
		this.text = text

		if (isUpdate) {
			this.setUpdateAvailable()
		} else if (isInstalled) {
			this.setInstalled()
		}

		this.action = async () => {
			this.is_loading = true
			parent.update()
			if (typeof action === 'function') await action(this.isGlobalInstall, pluginPath)
			this.is_loading = false
			this.setInstalled()
			parent.update()
		}
	}

	setUpdateAvailable() {
		this.is_disabled = false
		this.color = 'success'
		this.text = 'Update'
		this.icon = 'mdi-update'
	}
	setInstalled() {
		this.is_disabled = true
		this.text = 'Installed'
		this.icon = 'mdi-check'
		this.color = 'primary'
	}
}

export default class PluginCard {
	constructor(
		parent, {
			author,
			name,
			version,
			description,
			tags,
			link,
			id
		},
		close_parent = true
	) {
		this.key = `pluginCard-${id}`
		this.type = 'card'
		this.above_content = [{
			text: `${name}`,
		}, ]
		this.content = [{
				type: 'divider',
			},
			{
				type: 'container',
				display: 'inline-block',
				no_wrap: true,
				small_scrollbar: true,
				content: [
					...(tags || []).map((t, i) => ({
						type: 'tag',
						text: t,
						...tag(t, i),
						action: () => {
							if (close_parent) parent.close()
							new ListView(t)
						},
					})),
				].sort((a, b) => {
					if (a.icon && b.icon) return 0
					else if (a.icon) return -1
					if (b.icon) return 1
				}),
			},
			{
				text: `\n${description}\n\n`,
			},
			{
				type: 'divider',
			},
		]


		const {
			version: loadedVersion,
			pluginPath
		} = parent.plugin_map[id] || {}

		const button = new DownloadButton(
			this,
			async (isGlobal, pluginPath) => {
					await download(link, isGlobal, pluginPath)
					Session.setSessionInstalled(id, version)
				},
				link === undefined,
				loadedVersion !== undefined,
				greaterThan(version, loadedVersion || version),
				pluginPath,
				'Download',
		)

		this.below_content = [{
				key: `globalSwitch-${id}`,
				type: 'switch',
				text: 'Global Installation',
				input: button.isGlobalInstall,
				action: (val) => {
					button.isGlobalInstall = val
				}
			},
			{
				type: 'space',
			},
			button
		]

		this.update = () => {
			parent.update()
		}
	}
}