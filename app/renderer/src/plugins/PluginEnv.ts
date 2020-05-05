import { promises as fsp } from 'fs'
import Runtime from './Runtime'
import { trigger, readonlyTrigger } from './EventTriggers'
import PluginAssert from './PluginAssert'
import mkdirp from 'mkdirp'
import { join } from 'path'
import { run } from '../editor/ScriptRunner/run'

class Interpreter {
	constructor() {}

	wrap(code: string, file_path: string) {
		return `(function ${file_path.replace(
			/[^a-zA-Z]/g,
			'_'
		)}() {${code}})()`
	}

	/**
	 *
	 * @param {*} code
	 * @param {*} file_path
	 * @param {*} depth
	 * @param {*} is_module
	 * @param {Boolean} blocked Whether the environment should run inside blocked mode
	 */
	execute(code: string, file_path: string) {
		try {
			return run(this.wrap(code, file_path), {}, 'file')
		} catch (err) {
			PluginAssert.throw(file_path, err)

			let tmp = err.stack.split('\n')
			tmp.shift()
			console.groupCollapsed(
				`%c${err.message} inside ${file_path}.`,
				'background-color: #ff3d3d; color: white; padding: 0 2px; border-radius: 2px;'
			)
			console.log(tmp.join('\n'))
			console.groupEnd()
		}
	}

	async init(project: string) {
		Runtime.Paths.setProject(project)

		let path = join(Runtime.Paths.bridge(), 'plugin_storage')
		let u_path = join(Runtime.Paths.bridge(), 'uninstalled_plugins.json')
		mkdirp.sync(path)

		try {
			return JSON.parse((await fsp.readFile(u_path)).toString())
		} catch (e) {
			fsp.writeFile(u_path, '[]')
			return []
		}
	}
}

export default {
	Interpreter: new Interpreter(),
	getMenus: () => Runtime.Menus.get(),
	getPlugins: () => Runtime.Plugins.get(),
	getSidebar: () => Runtime.Sidebar.get(),
	Runtime: {
		getBridgePath: Runtime.Paths.bridge,
	},
	hl: {
		unregisterAll() {
			Runtime.HL.forEach(lang => Runtime.HL.remove(lang))
		},
	},
	reset: Runtime.reset,
	trigger: (name: string, arg: any, init = true, readonly = false) => {
		if (readonly) return readonlyTrigger(name, arg)
		return trigger(name, arg, init)
	},
}
