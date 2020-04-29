import Runtime from './Runtime'
import PluginLoader from './PluginLoader'
import path from 'path'
import JSONTree from '../editor/JsonTree'

export default class BlockedBridge {
	plugin_id: number
	__file_path__: any
	Cache: {
		write(): void
		open(): void
		openSync(): void
		Dependency: { add(): void; remove(): void }
	}
	Store: {
		namespace: any
		setup(): void
		load(): void
		save(): void
		exists(): void
	}
	FS: {
		readFile(): void
		writeFile(): void
		readFileSync(): void
		readDirectory(): void
		exists(): void
		stats(): void
	}
	JSONTree: typeof JSONTree
	Language: {
		register(): void
		remove(): void
		addKeywords(): void
		addTitles(): void
		addSymbols(): void
	}
	Menu: { register(): void }
	Sidebar: {
		register(): void
		update(): void
		remove(): void
		open(): void
		openDefault(): void
		close(): void
	}
	Footer: { register(): void; update(): void; remove(): void }
	Window: {
		register(): void
		update(): void
		remove(): void
		open(): void
		close(): void
	}
	BuildableFile: { register(): void }
	File: { register(): void }
	AutoCompletions: { add(): void }
	Utils: {
		readonly current_project: string
		readonly current_selected: string
		readonly current_file_path: string
		readonly current_file_content: string
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
			write() {},
			open() {},
			openSync() {},
			Dependency: {
				add() {},
				remove() {},
			},
		}
		this.Store = {
			namespace: undefined,
			setup() {},
			load() {},
			save() {},
			exists() {},
		}
		this.FS = {
			readFile() {},
			writeFile() {},
			readFileSync() {},
			readDirectory() {},
			exists() {},
			stats() {},
		}
		this.JSONTree = JSONTree
		this.Language = {
			register() {},
			remove() {},
			addKeywords() {},
			addTitles() {},
			addSymbols() {},
		}

		this.Menu = {
			register() {},
		}

		this.Sidebar = {
			register() {},
			update() {},
			remove() {},
			open() {},
			openDefault() {},
			close() {},
		}
		this.Footer = {
			register() {},
			update() {},
			remove() {},
		}
		this.Window = {
			register() {},
			update() {},
			remove() {},
			open() {},
			close() {},
		}
		this.BuildableFile = {
			register() {},
		}
		this.File = {
			register() {},
		}
		this.AutoCompletions = {
			add() {},
		}
		this.Utils = {
			get current_project() {
				return ''
			},
			get current_selected() {
				return ''
			},
			get current_file_path() {
				return ''
			},
			get current_file_content() {
				return ''
			},
		}
	}

	registerPlugin(plugin_info: any) {
		PluginLoader.pushPluginData({
			...plugin_info,
			id: path.basename(this.__file_path__, '.js'),
		})
	}
	on() {}
	off() {}
	trigger() {}
	open() {}
	openExternal() {}
}
