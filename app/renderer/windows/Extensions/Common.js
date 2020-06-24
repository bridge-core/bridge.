import {
	WEB_APP_PLUGINS,
	CURRENT
} from '../../src/constants'
import {
	readJSONSync
} from '../../src/Utilities/JsonFS'
import {
	promises as fs
} from 'fs'
import path from 'path'
import PluginLoader from '../../src/plugins/PluginLoader'
import LoadingWindow from '../LoadingWindow'
import EventBus from '../../src/EventBus'
import {
	createNotification
} from '../../src/UI/Footer/create'
import {
	DATA_PATH
} from '../../../shared/DefaultDir'

export const EXT_TAG_MAP = readJSONSync(
	path.join(__static, 'data/ext_tag_map.json')
)
/**
 * @type {import('../../src/Types/disposable').IDisposable}
 */
export let RELOAD_NOTIFICATION
export const createReloadPush = () => {
	if (RELOAD_NOTIFICATION !== undefined) return

	RELOAD_NOTIFICATION = createNotification({
		icon: 'mdi-refresh',
		message: 'Reload Plugins!',
		onClick: async () => {
			RELOAD_NOTIFICATION.dispose()
			RELOAD_NOTIFICATION = undefined

			let lw = new LoadingWindow().show()
			await PluginLoader.loadPlugins()
			lw.close()
		},
	})
}

export function tag(tag_name, index) {
	return EXT_TAG_MAP[tag_name] || EXT_TAG_MAP[`${index}`] || {}
}
export async function download(url, isGlobal = false, pluginPath) {
	await fetch(WEB_APP_PLUGINS + url)
		.then(data => data.arrayBuffer())
		.then(async data => {
			console.log(DATA_PATH, CURRENT.PROJECT_PATH, isGlobal)
			if (isGlobal == false) {
				await fs.mkdir(
					path.join(CURRENT.PROJECT_PATH, 'bridge/plugins'), {
						recursive: true,
					}
				)
				await fs.writeFile(
					pluginPath ? `${pluginPath}.zip` :
					path.join(
						CURRENT.PROJECT_PATH,
						'bridge/plugins',
						path.basename(url)
					),
					new Buffer(data)
				)
			} else {
				await fs
					.mkdir(path.join(DATA_PATH, "plugins"))
					.catch(() => {})
				await fs.writeFile(
					pluginPath ? `${pluginPath}.zip` :
					path.join(
						path.join(DATA_PATH, "plugins"),
						path.basename(url)
					),
					new Buffer(data)
				)
			}
			createReloadPush()
		})
		.catch(console.error)
}

export function getInfoMap() {
	let res = {}

	for (let {
			id,
			version,
			pluginPath
		} of PluginLoader.getInstalledPlugins()) {
		res[id] = {
			version,
			pluginPath
		}
	}

	return Object.assign(res, Session.session_installed)
}

EventBus.on('bridge:pluginsLoaded', () => {
	Session.session_installed = {}
	if (RELOAD_NOTIFICATION) RELOAD_NOTIFICATION.dispose()
})
export default class Session {
	static data
	static session_installed = {}

	static async open() {
		if (this.data !== undefined) return this.data
		this.data = await fetch(WEB_APP_PLUGINS + '/plugins.json')
			.then(raw => raw.json())
			.then(data =>
				data.map(({
					author,
					version,
					tags,
					...other
				}) => ({
					author,
					version,
					tags: [`v${version}`, author].concat(tags || []),
					...other,
				}))
			)
		return this.data
	}

	static setSessionInstalled(id, version) {
		this.session_installed[id] = version
	}

	static close() {
		this.data = undefined
	}
}