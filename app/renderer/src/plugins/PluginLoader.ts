/**
 * bridge. PluginLoader
 * Loads v1 & v2 plugins
 *
 * Unloading is still handled by store/modules/Plugins.js
 */
import { BASE_PATH, CURRENT } from '../constants'
import path from 'path'
import { promises as fs, createReadStream, Dirent } from 'fs'
import { readJSON } from '../Utilities/JsonFS'
import Store from '../../store/index'
import Bridge from './PluginEnv'
import EventBus from '../EventBus'
import { PluginSnippets } from '../../windows/Snippets'
import { UI_DATA, BridgeCore } from '../bridgeCore/main'
import ThemeManager from '../editor/Themes/ThemeManager'
import unzipper from 'unzipper'
import ComponentRegistry from './CustomComponents'
import InformationWindow from '../UI/Windows/Common/Information'
import Provider from '../autoCompletions/Provider'
import { addLoadLocation, resetLoadLocations } from '../Presets'
import {
	loadCustomCommands,
	CommandRegistry,
	updateCommandFiles,
} from './CustomCommands'
import FileType from '../editor/FileType'
import { run } from '../editor/ScriptRunner/run'

let PLUGIN_FOLDERS: string[]
let PLUGIN_DATA: any[] = []

interface AutoCompletionFormat {
	path?: string
	definition?: any
}

export default class PluginLoader {
	static unloaded_plugins: string[]

	static getInstalledPlugins() {
		return PLUGIN_DATA
	}
	static pushPluginData(data: any) {
		PLUGIN_DATA.push(data)
	}

	static reset() {
		CommandRegistry.clear()
		ComponentRegistry.reset()
		resetLoadLocations()
	}

	static async loadPlugins(project: string) {
		if (project === undefined) return
		//INIT LEGACY INTERPRETER & UNLOAD LEGACY PLUGINS
		Store.commit('unloadPlugins')

		let unloaded_plugins = await Bridge.Interpreter.init(project)
		this.unloaded_plugins = unloaded_plugins
		//Activate/Deactivate BridgeCore
		if (!unloaded_plugins.includes('bridge.core')) BridgeCore.activate()
		else BridgeCore.deactivate()

		try {
			PLUGIN_FOLDERS = await fs.readdir(
				path.join(BASE_PATH, project, 'bridge/plugins')
			)
		} catch (e) {
			PLUGIN_FOLDERS = []
		}

		let PLUGIN_ZIPS = PLUGIN_FOLDERS.filter(p => path.extname(p) === '.zip')
		PLUGIN_FOLDERS = PLUGIN_FOLDERS.filter(p => path.extname(p) !== '.zip')
		//Initialize PLUGIN_DATA with UI_DATA of BridgeCore
		PLUGIN_DATA = [UI_DATA]
		await Promise.all(
			PLUGIN_ZIPS.map(plugin_folder =>
				this.loadPlugin(project, plugin_folder, unloaded_plugins)
			)
		)
		await Promise.all(
			PLUGIN_FOLDERS.map(plugin_folder =>
				this.loadPlugin(project, plugin_folder, unloaded_plugins)
			)
		)
		await ThemeManager.loadTheme()
		//LOAD CUSTOM COMPONENENTS IN PROJECT
		this.loadComponents(CURRENT.PROJECT_PATH)
		//UPDATE COMPONENT REFERENCES
		await ComponentRegistry.updateFiles()

		//LOAD CUSTOM COMMANDS IN PROJECT
		try {
			await loadCustomCommands(
				path.join(CURRENT.PROJECT_PATH, 'commands')
			)
		} catch {}
		//UPDATE COMMAND REFERENCES
		updateCommandFiles()

		//Update Monaco Language services
		await FileType.registerMonacoLanguages()

		//INIT LEGACY PLUGIN DATA FOR UI
		Store.commit('finishedPluginLoading', PLUGIN_DATA)
		EventBus.trigger('bridge:pluginsLoaded')
	}

	static async loadPlugin(
		project: string,
		plugin_folder: string,
		unloaded_plugins: string[]
	) {
		let plugin_path = path.join(
			BASE_PATH,
			project,
			'bridge/plugins',
			plugin_folder
		)
		if ((await fs.lstat(plugin_path)).isFile()) {
			if (path.extname(plugin_path) === '.js') {
				//LEGACY PLUGINS
				new InformationWindow(
					'ERROR',
					`Legacy plugins are no longer supported: "${plugin_folder}"`
				)
			} else if (path.extname(plugin_path) === '.zip') {
				//Load archived plugins
				let unzip_path = path.join(
					BASE_PATH,
					project,
					'bridge/plugins',
					path.basename(plugin_folder, '.zip')
				)
				await createReadStream(plugin_path)
					.pipe(unzipper.Extract({ path: unzip_path }))
					.promise()

				/**
				 * Prevent loading plugin twice
				 * (once as folder and once as .zip)
				 */
				if (
					PLUGIN_FOLDERS.includes(
						path.basename(plugin_folder, '.zip')
					)
				) {
					PLUGIN_FOLDERS = PLUGIN_FOLDERS.filter(
						p => p !== path.basename(plugin_folder, '.zip')
					)
				}

				await Promise.all([
					fs.unlink(plugin_path),
					this.loadPlugin(
						project,
						path.basename(plugin_folder, '.zip'),
						unloaded_plugins
					),
				]).catch(e => {})
			}
		} else {
			let manifest
			try {
				manifest = await readJSON(
					path.join(plugin_path, 'manifest.json')
				)
			} catch (e) {
				return
			}

			//IF ACTIVE: LOAD PLUGIN
			if (manifest.id && !unloaded_plugins.includes(manifest.id)) {
				await Promise.all([
					this.loadScripts(plugin_path, manifest.api_version),
					this.loadSnippets(plugin_path),
					this.loadThemes(plugin_path),
					this.loadComponents(plugin_path),
					this.loadAutoCompletions(plugin_path),
					this.loadThemeCSS(plugin_path),
					loadCustomCommands(path.join(plugin_path, 'commands')),
				]).catch(e => {})
				addLoadLocation(path.join(plugin_path, 'presets'))
			}
			PLUGIN_DATA.push(manifest)
		}
	}

	static async loadScripts(plugin_path: string, api_version: number) {
		let scripts: string[]
		try {
			scripts = await fs.readdir(path.join(plugin_path, 'scripts'))
		} catch (e) {
			return
		}

		let data = await Promise.all(
			scripts.map(s => fs.readFile(path.join(plugin_path, 'scripts', s)))
		)
		data.forEach((d, i) => {
			if (api_version === 1) {
				new InformationWindow(
					'ERROR',
					`API version 1 is no longer supported inside "${path.basename(
						plugin_path
					)}"`
				)
			} else if (api_version === 2 || api_version === undefined) {
			} else {
				throw new Error('Undefined API Version: ' + api_version)
			}
		})
	}

	static async loadSnippets(plugin_path: string) {
		let snippets: string[] = await fs
			.readdir(path.join(plugin_path, 'snippets'))
			.catch(e => [])

		let loaded_snippets: any[] = await Promise.all(
			snippets.map(s =>
				readJSON(path.join(plugin_path, 'snippets', s)).catch(
					e => undefined
				)
			)
		)
		loaded_snippets.forEach(s => {
			if (s !== undefined) PluginSnippets.add(s)
		})
	}

	static async loadThemes(plugin_path: string) {
		let themes: string[] = await fs
			.readdir(path.join(plugin_path, 'themes'))
			.catch(e => [])

		let loaded_themes: any[] = await Promise.all(
			themes.map(t =>
				readJSON(path.join(plugin_path, 'themes', t)).catch(
					e => undefined
				)
			)
		)
		loaded_themes.forEach(t => {
			if (t !== undefined) ThemeManager.addTheme(t)
		})
	}

	static async loadThemeCSS(plugin_path: string) {
		let css_files = await fs
			.readdir(path.join(plugin_path, 'css'), { withFileTypes: true })
			.catch(e => [] as Dirent[])

		let css: string[] = await Promise.all(
			css_files.map(css_file => {
				if (css_file.isDirectory()) return
				return fs
					.readFile(path.join(plugin_path, 'css', css_file.name))
					.catch(e => undefined)
					.then(data => data.toString('utf-8'))
			})
		)

		css.forEach((css, i) => {
			ThemeManager.css.set(css_files[i].name, css)
		})
	}

	static async loadComponents(pluginPath: string) {
		let components: string[] = await fs
			.readdir(path.join(pluginPath, 'components'))
			.catch(e => [])

		await Promise.all(
			components.map(c =>
				this.loadComponent(path.join(pluginPath, 'components', c))
			)
		)
	}
	static async loadComponent(filePath: string, fileContent?: string) {
		if (fileContent === undefined)
			fileContent = (
				await fs.readFile(filePath).catch(e => undefined)
			)?.toString('utf-8')
		if (fileContent === undefined) return

		const promises: Promise<unknown>[] = []
		try {
			run(
				fileContent,
				{
					register: (c: any) =>
						promises.push(ComponentRegistry.register(c)),
					report: (info: string) =>
						new InformationWindow('Information', info, false),
				},
				'file'
			)
		} catch (e) {
			new InformationWindow(
				'ERROR',
				`Error while loading custom component:\n${e.message}`
			)
		}
		await Promise.all(promises)
	}

	static async loadAutoCompletions(plugin_path: string) {
		let auto_completions: string[] = await fs
			.readdir(path.join(plugin_path, 'auto_completions'))
			.catch(e => [])

		let formats: AutoCompletionFormat[] = await Promise.all(
			auto_completions.map(a =>
				readJSON(path.join(plugin_path, 'auto_completions', a)).catch(
					e => undefined
				)
			)
		)

		formats.forEach(({ path, definition } = {}) => {
			if (path === undefined || definition === undefined) return
			Provider.addPluginCompletion(path, definition)
		})
	}
}
