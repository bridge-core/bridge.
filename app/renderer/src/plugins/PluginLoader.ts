/**
 * bridge. PluginLoader
 * Loads v1 & v2 plugins
 *
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
import Provider from '../autoCompletions/Provider'
import { addLoadLocation, resetLoadLocations, IManifest } from '../Presets'
import {
	loadCustomCommands,
	CommandRegistry,
	updateCommandFiles,
} from './CustomCommands'
import FileType from '../editor/FileType'
import { createErrorNotification } from '../AppCycle/Errors'
import { loadUIComponents } from './UI/load'
import { createUIStore, TUIStore } from './UI/store'
import { IDisposable } from '../Types/disposable'
import {
	clearAll as clearAllDisposables,
	set as setDisposables,
	clear as clearDisposables,
} from './Disposables'
import { executeScript } from './scripts/execute'
import { DATA_PATH } from '../../../shared/DefaultDir'
import { on, trigger } from '../AppCycle/EventSystem'
import { loadCustomComponent } from './components/load'

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

	static async unloadPlugins() {
		//Only resets legacy JSON highlighter cache & file creator definition cache.
		//Can be removed once we have the new infrastructure in place
		FileType.reset()
		trigger('bridge:scriptRunner.resetCaches')

		//INIT LEGACY INTERPRETER & UNLOAD LEGACY PLUGINS
		Store.commit('unloadPlugins')
		clearAllDisposables()

		CommandRegistry.clear()
		ComponentRegistry.reset()
		resetLoadLocations()
	}

	static async unloadPlugin(pluginId: string) {
		clearDisposables(pluginId)
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
			unloadedPlugins = await readJSON(uninstalledPath)
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

		await Promise.all([
			//LOAD CORRECT THEME
			ThemeManager.loadTheme(),

			//LOAD CUSTOM COMPONENENTS IN PROJECT
			this.loadComponents(
				path.join(CURRENT.PROJECT_PATH, 'components'),
				[]
			).then(() => ComponentRegistry.updateFiles()),

			//LOAD CUSTOM COMMANDS IN PROJECT
			loadCustomCommands(
				path.join(CURRENT.PROJECT_PATH, 'commands'),
				[]
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
					this.loadSnippets(pluginPath, disposables),
					this.loadThemes(pluginPath, disposables),
					this.loadComponents(
						path.join(pluginPath, 'components'),
						disposables
					),
					this.loadAutoCompletions(pluginPath, disposables),
					this.loadFileDefs(pluginPath, disposables),
					this.loadThemeCSS(pluginPath, disposables),
					loadCustomCommands(
						path.join(pluginPath, 'commands'),
						disposables
					),
				]).catch(console.error)
				addLoadLocation(path.join(pluginPath, 'presets'))
			}

			PLUGIN_DATA.push({
				...manifest,
				pluginPath, //Used by extension store to update plugins
				pluginFolder, //Used for dynamic activation/deactivation of plugins
				basePath, //Used for dynamic activation/deactivation of plugins
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

	static async loadSnippets(pluginPath: string, disposables: IDisposable[]) {
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
		;(
			await Promise.all(
				loaded_snippets.map(s => {
					if (s !== undefined) return PluginSnippets.add(s)
				})
			)
		).forEach(disposable => disposables.push(disposable))
	}

	static async loadThemes(pluginPath: string, disposables: IDisposable[]) {
		// Fetches a list of the files in the plugin's themes folder
		let themes: string[] = await fs
			.readdir(path.join(pluginPath, 'themes'))
			.catch(e => [])

		// Fetches the contents of each file in the themes array
		let loaded_themes: any[] = await Promise.all(
			themes.map(t =>
				readJSON(path.join(pluginPath, 'themes', t)).catch(
					e => undefined
				)
			)
		)
		loaded_themes.forEach(t => {
			if (t !== undefined)
				disposables.push(
					ThemeManager.addTheme(t, pluginPath.startsWith(DATA_PATH))
				)
		})
	}

	static async loadThemeCSS(pluginPath: string, disposables: IDisposable[]) {
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

			disposables.push({
				dispose: () => {
					ThemeManager.css.delete(cssFiles[i].name)
				},
			})
		})
	}

	static async loadComponents(
		pluginPath: string,
		disposables: IDisposable[]
	) {
		let dirents: Dirent[] = await fs
			.readdir(path.join(pluginPath), { withFileTypes: true })
			.catch(e => [])

		const promises: Promise<unknown>[] = []

		dirents.map(dirent => {
			if (dirent.isDirectory()) {
				promises.push(
					this.loadComponents(
						path.join(pluginPath, dirent.name),
						disposables
					)
				)
			} else {
				promises.push(
					this.loadComponent(
						path.join(pluginPath, dirent.name),
						disposables
					)
				)
			}
		})

		await Promise.all(promises)
	}
	static async loadComponent(
		filePath: string,
		disposables: IDisposable[],
		fileContent?: string
	) {
		return await loadCustomComponent(filePath, disposables, fileContent)
	}

	static async loadAutoCompletions(
		pluginPath: string,
		disposables: IDisposable[]
	) {
		let autoCompletions: string[] = await fs
			.readdir(path.join(pluginPath, 'auto_completions'))
			.catch(e => [])

		let formats: AutoCompletionFormat[] = await Promise.all(
			autoCompletions.map(a =>
				readJSON(path.join(pluginPath, 'auto_completions', a)).catch(
					e => undefined
				)
			)
		)

		formats.forEach(({ path, definition } = {}) => {
			if (path === undefined || definition === undefined) return
			Provider.addPluginCompletion(path, definition, disposables)
		})
	}

	static async loadFileDefs(pluginPath: string, disposables: IDisposable[]) {
		let fileDefs: string[] = await fs
			.readdir(path.join(pluginPath, 'file_definitions'))
			.catch(e => [])

		disposables.push(
			Provider.addPluginFileDefs(
				pluginPath,
				(
					await Promise.all(
						fileDefs.map(file =>
							readJSON(
								path.join(pluginPath, 'file_definitions', file)
							).catch(e => undefined)
						)
					)
				).flat()
			)
		)
	}
}
