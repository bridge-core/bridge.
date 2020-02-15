import { promises as fs } from 'fs'
import mkdirp from 'mkdirp'
import Store from '../store/index'
import Vue from '../main'
import TabSystem from './TabSystem'
import { ipcRenderer } from 'electron'
import JSONTree from './editor/JsonTree'
import ProblemIterator from './editor/problems/Problems'
import PluginEnv from './plugins/PluginEnv'
import path from 'path'
import OmegaCache from './editor/OmegaCache'
import ConfirmWindow from './commonWindows/Confirm'
import InformationWindow from './commonWindows/Information'
import { readJSON } from './Utilities/JsonFS'
import { stripFileVersion } from './Utilities/FileVersioning'

ipcRenderer.on('openFile', (event, path) => {
	FileSystem.open(path)
})

export default class FileSystem {
	static get Cache() {
		throw new Error('Calling FileSystem.Cache is deprecated!')
	}
	static async save(
		file_path: string,
		content: string | Buffer,
		update = false,
		open = false
	) {
		await fs.mkdir(path.dirname(file_path), { recursive: true })
		await fs.writeFile(file_path, content)

		if (update) Vue.$root.$emit('refreshExplorer')
		if (open) this.addAsTab(file_path, content, undefined, content)
		PluginEnv.trigger('bridge:finishedSaving', file_path, true, false)
	}
	static async basicSave(
		path: string,
		content: string | Buffer,
		update = false,
		open = true
	) {
		if (path === undefined)
			new InformationWindow(
				'ERROR',
				"bridge. cannot save this tab's content!"
			)
		await fs.writeFile(path, content)

		if (update) Vue.$root.$emit('refreshExplorer')
		if (open) this.addAsTab(path, content, 0, content)
		PluginEnv.trigger('bridge:finishedSaving', path, true, false)
	}
	static basicSaveAs(
		path: string,
		content: string,
		update = false,
		open = true
	) {
		ipcRenderer.send('saveAsFileDialog', { path, content })
	}

	static async open(file_path: string) {
		if ((await fs.lstat(file_path)).isFile()) this.openFile(file_path)
		else this.openDir(file_path)
	}
	static async openFile(file_path: string) {
		let file: Buffer
		try {
			file = await fs.readFile(file_path)
		} catch {
			return
		}
		let cache
		try {
			cache = await OmegaCache.load(file_path)
		} catch {
			return this.loadFromDisk(file_path, file)
		}

		if (OmegaCache.isCacheFresh(file_path, cache, file.toString())) {
			let {
				cache_content,
				format_version,
				file_version,
				file_uuid,
			} = cache
			this.addAsTab(
				file_path,
				cache_content,
				format_version,
				null,
				file_version,
				file_uuid
			)
		} else {
			new ConfirmWindow(
				() => {
					OmegaCache.load(file_path)
						.then(
							({
								cache_content,
								format_version,
								file_version,
								file_uuid,
							}) => {
								this.addAsTab(
									file_path,
									cache_content,
									format_version,
									null,
									file_version,
									file_uuid
								)
							}
						)
						.catch(err => {
							this.loadFromDisk(file_path, file)
						})
				},
				() => {
					this.loadFromDisk(file_path, file)
				},
				`It looks like the file "${path.basename(
					file_path
				)}" was edited with a different editor. Do you want to open it from bridge.'s cache or from disk?`,
				{
					confirm_text: 'Cache',
					cancel_text: 'Disk',
				}
			)
		}
	}
	static async openDir(file_path: string) {
		let dirents = await fs.readdir(file_path, { withFileTypes: true })
		await Promise.all(
			dirents.map(async dirent => {
				if (dirent.isFile())
					await this.openFile(path.join(file_path, dirent.name))
				else await this.openDir(path.join(file_path, dirent.name))
			})
		)
	}

	static loadFromDisk(file_path: string, file: string | Buffer) {
		let file_str = file.toString()
		this.addAsTab(
			file_path,
			file_str,
			0,
			file,
			OmegaCache.extractFileVersion(file_path, file_str)
		)
	}

	static async loadFile(file_path: string) {
		let loaded
		try {
			loaded = await OmegaCache.load(file_path)
		} catch (e) {
			try {
				loaded = {
					format_version: 0,
					cache_content: await readJSON(file_path),
					file_version: 0,
				}
			} catch (e) {
				loaded = {
					format_version: 0,
					cache_content: {},
					file_version: 0,
				}
			}
		}

		let { format_version, cache_content } = loaded
		if (format_version === 1) {
			return JSONTree.buildFromCache(cache_content).toJSON()
		} else {
			return cache_content
		}
	}
	static async loadFileAsTree(file_path: string) {
		try {
			let { format_version, cache_content } = await OmegaCache.load(
				file_path
			)
			if (format_version === 1) {
				return JSONTree.buildFromCache(cache_content)
			} else {
				if (typeof cache_content === 'string') return
				return JSONTree.buildFromObject(cache_content)
			}
		} catch (e) {
			try {
				return JSONTree.buildFromObject(await readJSON(file_path))
			} catch (e) {}
		}
	}

	static addAsTab(
		file_path: string,
		data: any,
		format_version = 0,
		raw_data?: string | Buffer,
		file_version?: number,
		file_uuid?: string
	) {
		let tree
		if (format_version === 1) {
			tree = JSONTree.buildFromCache(data)
			ProblemIterator.findProblems(tree, file_path)
		}

		TabSystem.add({
			file_version,
			file_uuid,

			content:
				format_version === 1
					? tree
					: typeof data === 'string'
					? stripFileVersion(data)
					: data,
			raw_content: raw_data,
			file_path,
			is_compiled: format_version === 1,
			category: Store.state.Explorer.project.explorer,
			file_name: path.basename(file_path),
		})
	}
}
