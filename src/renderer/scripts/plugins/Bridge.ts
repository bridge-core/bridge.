import Runtime from './Runtime'
import { shell, ipcRenderer } from 'electron'
import fs from 'fs'
import Store from '../../store/index'
import { trigger, overwriteTrigger } from './EventTriggers'
import PluginAssert from './PluginAssert'
import TabSystem from '../TabSystem'
import FileSystem from '../FileSystem'
import { BASE_PATH, APP_VERSION } from '../constants'
import JSONTree from '../editor/JsonTree'
import Provider from '../autoCompletions/Provider'
import { walkSync } from '../autoCompletions/Dynamic'
import LoadingWindow from '../../windows/LoadingWindow'
import OmegaCache from '../editor/OmegaCache'
import FileType from '../editor/FileType'
import PluginLoader from './PluginLoader'
import path from 'path'
import { download } from 'electron-dl'

export default class Bridge {
	plugin_id: number
	__file_path__: string
	Cache: {
		open(path: any, cb: any): void
		openSync(): void
		write(): void
		Dependency: { add(): void; remove(): void; removeAll(): void }
	}
	JSONTree: typeof JSONTree
	Store: {
		namespace: any
		setup(namespace: any): void
		load(name: any): any
		save(name: any, data: any): void
		exists(name: any): boolean
	}
	FS: {
		__file_path__: string
		readFile(path: any, cb: any): void
		readFileSync(path: any): Buffer
		writeFile(
			path: any,
			data: any,
			cb: any,
			check?: boolean,
			add_file_version?: boolean
		): void
		readDirectory(path: any, cb: any): void
		readDirectorySync(path: any, deep?: boolean): string[]
		exists(path: any): boolean
		stats(path: any, cb: any): void
	}
	Language: {
		register(name: any, language: any): void
		remove(name: any): void
		addKeywords(keywords: any): void
		addTitles(titles: any): void
		addSymbols(symbols: any): void
	}
	Highlighter: { registerLanguage(): never; unregisterLanguage(): never }
	Menu: { register: (menu_input: any) => void }
	Sidebar: {
		register(sidebar_input: any): void
		update(sidebar: any): void
		remove(id: any): void
		open(id: any): void
		openDefault(): void
		close(): void
	}
	Footer: {
		register(footer_element: any): void
		update(footer_element: any): void
		remove(id: any): void
	}
	Window: {
		register(window: any): void
		update(window: any): void
		open(id: any): void
		close(id: any): void
		remove(id: any): void
	}
	BuildableFile: { register(file: any): void }
	File: { register(file_def: any): void }
	AutoCompletions: { add(path: any, store: any): void }
	Utils: {
		readonly base_path: string
		readonly current_project: any
		readonly current_selected: JSONTree
		readonly current_file_path: string
		readonly current_file_content: any
		readonly current_file_name: string
		readonly APP_VERSION: string
		downloadFile(file_url: String, file_path: String): void
	}

	constructor(is_module?: boolean, file_path?: string) {
		this.plugin_id = Runtime.Plugins.getRuntimeId()

		this.__file_path__ = file_path
		if (is_module) {
			Runtime.Plugins.add(this.plugin_id, 'module')
		} else {
			Runtime.Plugins.add(this.plugin_id, 'unknown')
		}

		this.Cache = {
			open(path, cb) {
				if (typeof cb !== 'function') return

				OmegaCache.load(path)
					.then(cb)
					.catch(err => cb({}))
			},
			openSync() {
				console.warn(
					'The Cache.openSync API is no longer supported in bridge. v0.13.0!'
				)
			},
			write() {
				console.warn(
					'The Cache.write API is no longer supported in bridge. v0.13.0!'
				)
			},
			Dependency: {
				add() {
					console.warn(
						'The Cache.Dependency API is no longer supported in bridge. v0.13.0!'
					)
				},
				remove() {
					console.warn(
						'The Cache.Dependency API is no longer supported in bridge. v0.13.0!'
					)
				},
				removeAll() {
					console.warn(
						'The Cache.Dependency API is no longer supported in bridge. v0.13.0!'
					)
				},
			},
		}
		this.JSONTree = JSONTree

		this.Store = {
			namespace: undefined,

			setup(namespace) {
				if (namespace == undefined)
					throw new Error('You need to define a namespace')
				this.namespace = namespace + '/'
				fs.mkdir(Runtime.Paths.store() + namespace, err => {
					if (err && !err.message.includes('file already exists'))
						throw err
				})
			},
			load(name) {
				if (this.namespace == undefined)
					throw new Error(
						'You need to define a namespace using Bridge.Store.setup(namespace)'
					)
				return JSON.parse(
					fs
						.readFileSync(
							Runtime.Paths.store() + this.namespace + name
						)
						.toString()
				)
			},
			save(name, data) {
				if (this.namespace == undefined)
					throw new Error(
						'You need to define a namespace using Bridge.Store.setup(namespace)'
					)
				try {
					return fs.writeFileSync(
						Runtime.Paths.store() + this.namespace + name,
						JSON.stringify(data)
					)
				} catch (e) {
					throw new Error(
						'Provided data is not a valid store content.'
					)
				}
			},
			exists(name) {
				if (this.namespace == undefined)
					throw new Error(
						'You need to define a namespace using Bridge.Store.setup(namespace)'
					)
				return fs.existsSync(
					Runtime.Paths.store() + this.namespace + name
				)
			},
		}

		this.FS = {
			__file_path__: file_path,
			readFile(path, cb) {
				fs.readFile(Runtime.Paths.project() + path, (err, data) => {
					if (err && !cb) PluginAssert.throw(this.__file_path__, err)
					cb(err, data)
				})
			},
			readFileSync(path) {
				try {
					return fs.readFileSync(
						(Runtime.Paths.project() + path).replace(/\//g, '\\')
					)
				} catch (err) {
					PluginAssert.throw(this.__file_path__, err)
				}
			},
			writeFile(path, data, cb, check = true, add_file_version = true) {
				let folder = path.split(/\\|\//g)
				folder.pop()
				folder = folder.join('\\')

				if (check && !this.exists(Runtime.Paths.project() + folder)) {
					fs.mkdir(Runtime.Paths.project() + folder, err => {
						this.writeFile(path, data, cb, false)
					})
				} else if (add_file_version) {
					fs.readFile(path, (err, read_file) => {
						let fv
						if (err)
							fv = `${FileType.getCommentChar(
								Runtime.Paths.project() + path
							)}bridge-file-version: #0\n`
						else
							fv = `${FileType.getCommentChar(
								Runtime.Paths.project() + path
							)}bridge-file-version: #${OmegaCache.extractFileVersion(
								path,
								read_file.toString()
							) || 0}\n`

						fs.writeFile(
							Runtime.Paths.project() + path,
							fv + data,
							err => {
								if (err && !cb)
									PluginAssert.throw(this.__file_path__, err)
								else cb(err)
							}
						)
					})
				} else {
					fs.writeFile(Runtime.Paths.project() + path, data, err => {
						if (err && !cb)
							PluginAssert.throw(this.__file_path__, err)
						else cb(err)
					})
				}
			},
			readDirectory(path, cb) {
				fs.readdir(Runtime.Paths.project() + path, (err, data) => {
					if (err && !cb) PluginAssert.throw(this.__file_path__, err)
					cb(err, data)
				})
			},
			readDirectorySync(path, deep = false) {
				if (deep)
					return walkSync(Runtime.Paths.project() + path).map(e => {
						return e
							.replace(
								BASE_PATH.replace(/\//g, '\\') +
									Store.state.Explorer.project.explorer +
									'\\',
								''
							)
							.replace(/\\/g, '/')
					})
				else return fs.readdirSync(Runtime.Paths.project() + path)
			},
			exists(path) {
				return fs.existsSync(
					(Runtime.Paths.project() + path).replace(/\//g, '\\')
				)
			},
			stats(path, cb) {
				fs.stat(Runtime.Paths.project() + path, (err, data) => {
					if (err && !cb) PluginAssert.throw(this.__file_path__, err)
					cb(err, data)
				})
			},
		}
		this.Language = {
			register(name, language) {
				if (!Runtime.HL.exists(name)) {
					//hljs.registerLanguage(name, language);
					Runtime.HL.add(name, language)
				}
			},
			remove(name) {
				if (Runtime.HL.exists(name)) {
					//hljs.unregisterLanguage(name);
					Runtime.HL.remove(name)
				}
			},

			addKeywords(keywords) {
				Store.commit('addPluginKeywords', keywords)
			},
			addTitles(titles) {
				Store.commit('addPluginTitles', titles)
			},
			addSymbols(symbols) {
				Store.commit('addPluginSymbols', symbols)
			},
		}
		this.Highlighter = {
			registerLanguage() {
				throw new Error(
					'Using Highlighter.registerLanguage(...) is deprecated.'
				)
			},
			unregisterLanguage() {
				throw new Error(
					'Using Highlighter.unregisterLanguage(...) is deprecated.'
				)
			},
		}

		this.Menu = {
			register: menu_input => {
				throw new Error(
					'Using Bridge.Menu.register(...) is deprecated.'
				)
			},
		}

		this.Sidebar = {
			register(sidebar_input) {
				if (Array.isArray(sidebar_input)) {
					Runtime.Sidebar.add(...sidebar_input)
					sidebar_input.forEach(input =>
						Store.commit('addPluginSidebar', input)
					)
				} else {
					Runtime.Sidebar.add(sidebar_input)
					Store.commit('addPluginSidebar', sidebar_input)
				}
			},
			update(sidebar) {
				Store.commit('updatePluginSidebar', sidebar)
			},
			remove(id) {
				Store.commit('removePluginSidebar', id)
			},
			open(id) {
				Store.commit('openPluginSidebar', id)
			},
			openDefault() {
				Store.commit('setSidebarMenu', 1)
			},
			close() {
				Store.commit('setSidebarMenu', 0)
			},
		}

		this.Footer = {
			register(footer_element) {
				if (footer_element.id === undefined)
					throw new Error('No footer id defined.')
				Store.commit('addPluginFooter', footer_element)
			},
			update(footer_element) {
				Store.commit('updatePluginFooter', footer_element)
			},
			remove(id) {
				Store.commit('removePluginFooter', id)
			},
		}

		this.Window = {
			register(window) {
				if (window.id === undefined)
					throw new Error('No window id defined.')
				Store.commit('addPluginWindow', { ...window, is_plugin: true })
			},
			update(window) {
				Store.commit('updatePluginWindow', {
					...window,
					is_plugin: true,
				})
			},
			open(id) {
				Store.commit('setWindowIsVisible', {
					id,
					val: true,
					is_plugin: true,
				})
			},
			close(id) {
				Store.commit('setWindowIsVisible', {
					id,
					val: false,
					is_plugin: true,
				})
			},
			remove(id) {
				Store.commit('removePluginWindow', id)
			},
		}

		this.BuildableFile = {
			register(file) {
				function toObject(t: { display_name: string; content: any }[]) {
					let obj: any = {}
					t.forEach(e => (obj[e.display_name] = e.content))
					return obj
				}
				Provider.addPluginFileDef({
					file_creator: {
						...file.sidebar_element,
						...file.options,
						templates: toObject(file.templates),
					},
				})
			},
		}
		this.File = {
			register(file_def) {
				Provider.addPluginFileDef(file_def)
			},
		}
		this.AutoCompletions = {
			add(path, store) {
				Provider.addPluginCompletion(path, store)
			},
		}

		this.Utils = {
			get base_path() {
				return BASE_PATH + Store.state.Explorer.project.explorer + '\\'
			},
			get current_project() {
				return Store.state.Explorer.project.explorer
			},
			get current_selected() {
				return TabSystem.getCurrentNavObj()
			},
			get current_file_path() {
				return TabSystem.getSelected().file_path.replace(/\\/g, '/')
			},
			get current_file_content() {
				return TabSystem.getSelected().content
			},
			get current_file_name() {
				let arr = TabSystem.getSelected()
					.file_path.split(/\/|\\/g)
					.pop()
					.split('.')
				arr.pop()
				return arr.join('.')
			},
			get APP_VERSION() {
				return APP_VERSION
			},
			async downloadFile(file_url, file_path) {
				await ipcRenderer
					.invoke('bridge:downloadFile', file_url, file_path)
					.catch(error => {
						throw error
					})
			},
		}
	}

	registerPlugin(plugin_info: any) {
		PluginLoader.pushPluginData({
			...plugin_info,
			id: path.basename(this.__file_path__, '.js'),
		})
	}

	on(event: string, cb: (...args: any[]) => any) {
		Runtime.Listeners.add(event, cb)
	}
	off(event: string, cb: (...args: any[]) => any) {
		if (!cb)
			PluginAssert.throw(
				'PLUGIN',
				new Error(
					'You need to define a callback in order to remove an event listener.'
				)
			)
		Runtime.Listeners.remove(event, cb)
	}
	trigger(name: string, arg: any, basic = false) {
		if (basic) {
			return overwriteTrigger(name, arg)
		} else {
			return trigger(name, arg)
		}
	}
	/**
	 * @deprecated
	 */
	open({ content, file_name, file_path }: any) {
		TabSystem.add({
			content,
			raw_content: content,
			file_path,
			file_name,
		})
	}
	openFile(path: string) {
		new LoadingWindow('open-file').show()
		setTimeout(() => FileSystem.open(path), 75)
	}
	openExternal(path: string) {
		shell.openExternal(path)
	}
}
