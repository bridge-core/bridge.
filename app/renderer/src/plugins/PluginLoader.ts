/**
 * bridge. PluginLoader
 * Loads v1 & v2 plugins
 *
 * Unloading is still handled by store/modules/Plugins.js
 */
import { CURRENT } from '../constants'
import path from 'path'
import { promises as fs, createReadStream, Dirent } from 'fs'
import { readJSON } from '../Utilities/JsonFS'
import Store from '../../store/index'
import EventBus from '../EventBus'
import { PluginSnippets } from '../../windows/Snippets'
import { UI_DATA, BridgeCore } from '../bridgeCore/main'
import ThemeManager from '../editor/Themes/ThemeManager'
import unzipper from 'unzipper'
import ComponentRegistry from './CustomComponents'
import InformationWindow from '../UI/Windows/Common/Information'
import Provider from '../autoCompletions/Provider'
import { addLoadLocation, resetLoadLocations, IManifest } from '../Presets'
import {
	loadCustomCommands,
	CommandRegistry,
	updateCommandFiles,
} from './CustomCommands'
import FileType from '../editor/FileType'
import { run } from '../editor/ScriptRunner/run'
import { createErrorNotification } from '../AppCycle/Errors'
import { loadUIComponents } from './UI/load'
import { createUIStore, TUIStore } from './UI/store'
import { createSidebar } from '../UI/Sidebar/create'
import { IDisposable } from '../Types/disposable'
import {
	clearAll as clearAllDisposables,
	set as setDisposables,
} from './Disposables'
import { executeScript } from './scripts/execute'
import { createEnv, createLimitedEnv } from './scripts/require'
import { DATA_PATH } from '../../../shared/DefaultDir'
import { on } from '../AppCycle/EventSystem'

let PLUGIN_FOLDERS: [string, string][] = []
let PLUGIN_DATA: any[] = []

interface AutoCompletionFormat {
	path?: string
	definition?: any
}

on('bridge:reloadPlugins', () => {
	PluginLoader.loadPlugins(CURRENT.PROJECT)
})
export default class PluginLoader {
	static unloadedPlugins: string[]

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

	static async unloadPlugins() {
		//INIT LEGACY INTERPRETER & UNLOAD LEGACY PLUGINS
		Store.commit('unloadPlugins')
		clearAllDisposables()
	}

	static async loadPlugins(
		basePaths = [path.join(CURRENT.PROJECT_PATH, 'bridge'), DATA_PATH]
	) {
		this.unloadPlugins()

		//Disabling/Enabling of plugins always works per workspace
		const uninstalledPath = path.join(
			CURRENT.PROJECT_PATH,
			'bridge/uninstalled_plugins.json'
		)
		let unloadedPlugins: string[]
		try {
			unloadedPlugins = JSON.parse(
				(await fs.readFile(uninstalledPath)).toString()
			)
		} catch {
			fs.mkdir(path.join(CURRENT.PROJECT_PATH, 'plugins'), {
				recursive: true,
			}).finally(() => fs.writeFile(uninstalledPath, '[]'))
			unloadedPlugins = []
		}

		this.unloadedPlugins = unloadedPlugins
		//Activate/Deactivate BridgeCore
		if (!unloadedPlugins.includes('bridge.core')) BridgeCore.activate()
		else BridgeCore.deactivate()

		PLUGIN_FOLDERS = []
		try {
			await Promise.all(
				basePaths.map(basePath =>
					fs
						.readdir(path.join(basePath, 'plugins'))
						.then(pluginFolders =>
							pluginFolders.forEach(pluginFolder =>
								PLUGIN_FOLDERS.push([basePath, pluginFolder])
							)
						)
				)
			)
		} catch {}

		let PLUGIN_ZIPS = PLUGIN_FOLDERS.filter(
			([_, p]) => path.extname(p) === '.zip'
		)
		PLUGIN_FOLDERS = PLUGIN_FOLDERS.filter(
			([_, p]) => path.extname(p) !== '.zip'
		)
		//Initialize PLUGIN_DATA with UI_DATA of BridgeCore
		PLUGIN_DATA = [UI_DATA]
		await Promise.all(
			PLUGIN_ZIPS.map(([basePath, pluginFolder]) =>
				this.loadPlugin(basePath, pluginFolder, unloadedPlugins)
			)
		)
		await Promise.all(
			PLUGIN_FOLDERS.map(([basePath, pluginFolder]) =>
				this.loadPlugin(basePath, pluginFolder, unloadedPlugins)
			)
		)
		await ThemeManager.loadTheme()

		await Promise.all([
			//LOAD CUSTOM COMPONENENTS IN PROJECT
			this.loadComponents(CURRENT.PROJECT_PATH).then(() =>
				ComponentRegistry.updateFiles()
			),

			//LOAD CUSTOM COMMANDS IN PROJECT
			loadCustomCommands(
				path.join(CURRENT.PROJECT_PATH, 'commands')
			).then(() => updateCommandFiles()),
		])

		//Update Monaco Language services
		await FileType.registerMonacoLanguages()

		//INIT LEGACY PLUGIN DATA FOR UI
		Store.commit('finishedPluginLoading', PLUGIN_DATA)
		EventBus.trigger('bridge:pluginsLoaded')
	}

	static async loadPlugin(
		basePath: string,
		pluginFolder: string,
		unloadedPlugins: string[]
	) {
		let pluginPath = path.join(basePath, 'plugins', pluginFolder)
		if ((await fs.lstat(pluginPath)).isFile()) {
			if (path.extname(pluginPath) === '.js') {
				//LEGACY PLUGINS
				if (!unloadedPlugins.includes(path.basename(pluginPath, '.js')))
					createErrorNotification(
						new Error(
							`LEGACY PLUGIN: Legacy plugins are no longer supported: "${pluginFolder}"`
						)
					)
			} else if (path.extname(pluginPath) === '.zip') {
				//Load archived plugins
				let unzip_path = path.join(
					basePath,
					'plugins',
					path.basename(pluginFolder, '.zip')
				)
				await createReadStream(pluginPath)
					.pipe(unzipper.Extract({ path: unzip_path }))
					.promise()

				/**
				 * Prevent loading plugin twice
				 * (once as folder and once as .zip)
				 */
				const index = PLUGIN_FOLDERS.findIndex(
					([_, tmpPluginFolder]) =>
						tmpPluginFolder === path.basename(pluginFolder, '.zip')
				)
				if (index !== -1) PLUGIN_FOLDERS.splice(index, 1)

				await Promise.all([
					fs.unlink(pluginPath),
					this.loadPlugin(
						basePath,
						path.basename(pluginFolder, '.zip'),
						unloadedPlugins
					),
				]).catch(e => {})
			}
		} else {
			let manifest: any
			try {
				manifest = await readJSON(
					path.join(pluginPath, 'manifest.json')
				)
			} catch (e) {
				return
			}
			const uiStore = createUIStore()
			const disposables: IDisposable[] = []
			disposables.push(uiStore)

			//IF ACTIVE: LOAD PLUGIN
			if (manifest.id && !unloadedPlugins.includes(manifest.id)) {
				await Promise.all([
					loadUIComponents(
						path.join(pluginPath, 'ui'),
						uiStore,
						disposables
					).finally(() =>
						this.loadScripts(
							pluginPath,
							manifest.api_version,
							uiStore,
							disposables
						)
					),
					this.loadSnippets(pluginPath),
					this.loadThemes(pluginPath),
					this.loadComponents(pluginPath),
					this.loadAutoCompletions(pluginPath),
					this.loadThemeCSS(pluginPath),
					loadCustomCommands(path.join(pluginPath, 'commands')),
				]).catch(console.error)
				addLoadLocation(path.join(pluginPath, 'presets'))
			}
			PLUGIN_DATA.push({
				...manifest,
				pluginPath, //Used by extension store to update plugins
			})
			setDisposables(manifest.id, disposables)
		}
	}

	static async loadScripts(
		pluginPath: string,
		api_version: number,
		uiStore: TUIStore,
		disposables: IDisposable[]
	) {
		let scripts: string[]
		try {
			scripts = await fs.readdir(path.join(pluginPath, 'scripts'))
		} catch (e) {
			return
		}

		let data = await Promise.all(
			scripts.map(s =>
				fs
					.readFile(path.join(pluginPath, 'scripts', s))
					.then(buffer => buffer.toString('utf-8'))
			)
		)
		data.forEach((d, i) => {
			if (api_version === 1) {
				createErrorNotification(
					new Error(
						`API VERSION 1: API version 1 is no longer supported inside "${path.basename(
							pluginPath
						)}"`
					)
				)
			} else if (api_version === 2 || api_version === undefined) {
				data.forEach(script =>
					executeScript(script, uiStore, disposables)
				)
			} else {
				createErrorNotification(
					new Error(
						`UNDEFINED API VERSION: API version ${api_version} is not supported!`
					)
				)
			}
		})
	}

	static async loadSnippets(pluginPath: string) {
		let snippets: string[] = await fs
			.readdir(path.join(pluginPath, 'snippets'))
			.catch(e => [])

		let loaded_snippets: any[] = await Promise.all(
			snippets.map(s =>
				readJSON(path.join(pluginPath, 'snippets', s)).catch(
					e => undefined
				)
			)
		)
		loaded_snippets.forEach(s => {
			if (s !== undefined) PluginSnippets.add(s)
		})
	}

	static async loadThemes(pluginPath: string) {
		let themes: string[] = await fs
			.readdir(path.join(pluginPath, 'themes'))
			.catch(e => [])

		let loaded_themes: any[] = await Promise.all(
			themes.map(t =>
				readJSON(path.join(pluginPath, 'themes', t)).catch(
					e => undefined
				)
			)
		)
		loaded_themes.forEach(t => {
			if (t !== undefined) ThemeManager.addTheme(t)
		})
	}

	static async loadThemeCSS(pluginPath: string) {
		let cssFiles = await fs
			.readdir(path.join(pluginPath, 'styles'), { withFileTypes: true })
			.catch(e => [] as Dirent[])

		let css: string[] = await Promise.all(
			cssFiles.map(cssFile => {
				if (cssFile.isDirectory()) return
				return fs
					.readFile(path.join(pluginPath, 'styles', cssFile.name))
					.catch(e => undefined)
					.then(data => data.toString('utf-8'))
			})
		)

		css.forEach((css, i) => {
			ThemeManager.css.set(cssFiles[i].name, css)
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
			await run(
				fileContent,
				[
					createLimitedEnv(),
					{
						register: (c: any) =>
							promises.push(ComponentRegistry.register(c)),
						report: (info: string) =>
							new InformationWindow('Information', info, false),
					},
				],
				{
					executionContext: 'file',
					envName: 'require, Bridge',
					async: true,
				}
			)
		} catch (err) {
			createErrorNotification(err)
		}

		await Promise.all(promises)
	}

	static async loadAutoCompletions(pluginPath: string) {
		let auto_completions: string[] = await fs
			.readdir(path.join(pluginPath, 'auto_completions'))
			.catch(e => [])

		let formats: AutoCompletionFormat[] = await Promise.all(
			auto_completions.map(a =>
				readJSON(path.join(pluginPath, 'auto_completions', a)).catch(
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
