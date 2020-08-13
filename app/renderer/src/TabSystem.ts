/**
 * Implements bridge.'s TabSystem functionality
 */
import Store from '../store/index'
import EventBus from './EventBus'
import { Format } from './editor/Json'
import FileSystem from './FileSystem'
import JSONTree from './editor/JsonTree'
import LoadingWindow from '../windows/LoadingWindow'
import { History } from './TabSystem/CommonHistory'
import path from 'path'
import FileType from './editor/FileType'
import OmegaCache, { FormatVersion } from './editor/OmegaCache'
import LightningCache from './editor/LightningCache'
import { BridgeCore } from './bridgeCore/main'
import { uuid } from './Utilities/useAttr'
import { useCache } from './Project/NoCacheConfig'
import { getFolderDiff } from './files/DiffPaths'
import { editor, Uri } from 'monaco-editor'
import { trigger } from './AppCycle/EventSystem'
import { createCloseUnsavedTabWindow } from './UI/Windows/CloseUnsavedTab/definition'

export interface Tab {
	file_name: string
	file_path: string
	content: string | any | JSONTree
	raw_content: Buffer
	uuid: string
	file_navigation: string
	category: string
	is_unsaved: boolean
	history: History
	file_version: number
	folders: string[]

	is_immutable?: boolean
	is_compiled?: boolean
	is_invalid?: boolean
}
export interface ProjectData {
	[x: string]: Tab[]
}

/**
 * @todo Refactor TabSystem to use dedicated classes IMGTab, CMTab, JSONTab,...
 * Makes the TabSystem less complex
 * @todo Class JsonSelection to handle selected nodes
 */
class TabSystem {
	private main_screen_projects: ProjectData
	private split_screen_projects: ProjectData
	private main_screen_selected = 0
	private split_screen_selected = 0

	constructor() {
		this.main_screen_projects = {}
		this.split_screen_projects = {}
	}
	get project() {
		return Store.state.Explorer.project.explorer
	}
	//Whether the user has unsaved tabs open in any project
	get contains_unsaved() {
		for (let p in this.main_screen_projects) {
			for (let t of this.main_screen_projects[p] || [])
				if (t.is_unsaved) return true
		}

		for (let p in this.split_screen_projects) {
			for (let t of this.split_screen_projects[p] || [])
				if (t.is_unsaved) return true
		}

		return false
	}
	get split_screen_active() {
		return Store.state.TabSystem.split_screen_active
	}
	set split_screen_active(val: boolean) {
		if (val === this.split_screen_active) return

		Store.commit('setSplitScreenActive', val)
		EventBus.trigger('updateFileNavigation', this.getCurrentNavigation())
	}
	get projects() {
		return this.split_screen_active
			? this.split_screen_projects
			: this.main_screen_projects
	}
	set projects(val) {
		if (this.split_screen_active) this.split_screen_projects = val
		else this.main_screen_projects = val
	}
	getProjects(split_screen?: boolean): ProjectData {
		if (split_screen === undefined) return this.projects
		else if (split_screen) return this.split_screen_projects
		else return this.main_screen_projects
	}
	getCurrentProjects(split_screen?: boolean) {
		return this.getProjects(split_screen)[this.project] || []
	}
	getCurrentTabs(split_screen?: boolean) {
		return this.getProjects(split_screen)[this.project] || []
	}
	get selected() {
		return this.split_screen_active
			? this.split_screen_selected
			: this.main_screen_selected
	}
	set selected(val) {
		if (this.split_screen_active) this.split_screen_selected = val
		else this.main_screen_selected = val
	}
	getSelectedIndex(split_screen?: boolean) {
		if (split_screen === undefined) return this.selected
		else if (split_screen) return this.split_screen_selected
		else return this.main_screen_selected
	}

	//Adding tab
	add(tab: any, split_screen?: boolean) {
		let projects
		if ((this.main_screen_projects[this.project] || []).length === 0) {
			this.split_screen_active = false
			projects = this.getProjects(false)
		} else {
			projects = this.getProjects(split_screen)
		}

		if (projects[this.project] === undefined) projects[this.project] = []
		const file_name = path.basename(tab.file_path)
		const folders: string[] = []

		for (let i = 0; i < projects[this.project].length; i++) {
			const {
				file_path,
				file_name: curr_file_name,
				folders: curr_folders,
			} = projects[this.project][i]
			if (file_path === tab.file_path) {
				Store.commit('removeLoadingWindow', { id: 'open-file' })
				return this.select(i)
			} else if (curr_file_name === file_name) {
				const [folder_1, folder_2] = getFolderDiff(
					file_path,
					tab.file_path
				)
				if (!curr_folders.includes(folder_1))
					curr_folders.push(folder_1)
				if (!folders.includes(folder_2)) folders.push(folder_2)
			}
		}

		projects[this.project].unshift({
			file_name,
			folders,
			...tab,
			uuid: `${this.project}-${uuid()}`,
			file_navigation: 'global',
			category: this.project,
			is_unsaved: false,
			history: new History(),
		})
		EventBus.trigger('updateTabUI')
		this.select(0)
	}
	open(tab: any) {
		//Just an alias
		this.add(tab)
	}
	isOpen(file_path: string, select = false) {
		if (this.projects[this.project] === undefined)
			this.projects[this.project] = []

		for (let i = 0; i < this.projects[this.project].length; i++) {
			if (
				this.projects[this.project][i].file_path ===
				file_path.replace(/\//g, '\\')
			) {
				if (select) this.select(i)
				return true
			}
		}
		return false
	}
	isSelected(file_path: string) {
		if (
			this.projects[this.project] === undefined ||
			file_path === undefined
		)
			return false

		if (this.getSelected().file_path === file_path.replace(/\//g, '\\')) {
			return true
		}
		return false
	}

	//Closing tab
	internalCloseId(id: number, project = this.project) {
		//Remove same folder display
		const { file_path, file_name, content } = this.projects[this.project][
			id
		]
		for (let i = 0; i < this.projects[this.project].length; i++) {
			if (id === i) continue
			const {
				file_path: curr_file_path,
				file_name: curr_file_name,
				folders: curr_folders,
			} = this.projects[this.project][i]

			if (curr_file_name === file_name) {
				const [folder_1] = getFolderDiff(curr_file_path, file_path)
				curr_folders.splice(curr_folders.indexOf(folder_1), 1)
			}
		}

		//Dipose JSONTree
		if (content instanceof JSONTree) content.dispose()

		const [removed] = this.projects[project].splice(id, 1)
		//Dispose monaco model
		editor.getModel(Uri.file(removed.file_path))?.dispose()
		//Update selected tab
		if (id <= this.selected && this.selected >= 0) {
			this.select(this.selected === 0 ? 0 : this.selected - 1)
		}

		//Make split-screen main-screen if main-screen empty
		if (this.main_screen_projects[this.project].length === 0) {
			this.main_screen_projects[
				this.project
			] = this.split_screen_projects[this.project]
			this.split_screen_projects[this.project] = []
			this.main_screen_selected = this.split_screen_selected
			this.split_screen_selected = 0
			this.split_screen_active = false
		} else if (
			this.split_screen_projects[this.project] !== undefined &&
			this.split_screen_projects[this.project].length === 0
		) {
			this.split_screen_active = false
		}

		EventBus.trigger('updateTabUI')
	}
	closeById(id: number, project = this.project) {
		if (!this.getSelected()) return

		if (
			this.projects[project][id].is_unsaved &&
			!this.projects[project][id].is_immutable
		) {
			createCloseUnsavedTabWindow(
				async () => {
					await this.saveCurrent()
					this.internalCloseId(id, project)
				},
				() => {
					this.internalCloseId(id, project)
				},
				() => {}
			)
		} else {
			this.internalCloseId(id, project)
		}
	}
	closeSelected() {
		this.closeById(this.selected)
	}
	close(val?: number) {
		if (val === undefined) {
			this.projects = {}
			this.select(0)
			EventBus.trigger('updateTabUI')
		} else if (typeof val == 'number') this.closeById(val)
		else
			throw new TypeError(
				'Expected undefined or number, found ' + typeof val
			)
	}
	closeByPath(file_path: string) {
		if (this.projects[this.project] === undefined) return false

		for (let i = 0; i < this.projects[this.project].length; i++) {
			if (
				this.projects[this.project][i].file_path.replace(/\\/g, '/') ===
				file_path.replace(/\\/g, '/')
			) {
				this.internalCloseId(i)
				return true
			}
		}
		return false
	}

	//Getting tabs
	get(val?: number) {
		if (!val) return this.projects[this.project]
		else if (typeof val === 'number')
			return this.projects[this.project][val]
		else
			throw new TypeError(
				'Expected undefined or number, found ' + typeof val
			)
	}
	getSelected() {
		if (this.projects[this.project] === undefined) return
		return this.projects[this.project][this.selected]
	}
	getCurrentNavigation() {
		if (!this.getSelected()) return
		return this.getSelected().file_navigation
	}
	getCurrentFileName() {
		if (!this.getSelected()) return
		return path.basename(this.getSelected().file_path)
	}
	getCurrentFilePath() {
		if (!this.getSelected()) return
		return this.getSelected().file_path
	}
	getCurrentNavContent(): string {
		let s = this.getSelected()
		if (s === undefined || !(s.content instanceof JSONTree)) return

		let nav = this.getCurrentNavigation()
		let current = (s.content as JSONTree).get(nav)

		if (!current) return

		if (current.path !== nav) return current.data
		return current.key
	}
	getCurrentNavObj() {
		let s = this.getSelected()
		if (s === undefined || !(s.content instanceof JSONTree)) return

		let nav = this.getCurrentNavigation()
		return (s.content as JSONTree).get(nav)
	}
	getHistory() {
		return this.getSelected()?.history
	}
	setCurrentNavContent(val: string) {
		let nav = this.getCurrentNavigation()
		let current = this.getCurrentNavObj()
		if (!current) return

		if (current.path != nav) current.data = val
		else current.key = val
		current.updateUUID()

		EventBus.trigger('updateCurrentContent')
	}
	navigationBack() {
		let nav = this.getCurrentNavigation().split('/')
		nav.pop()
		this.setCurrentFileNav(nav.join('/'))
	}

	//Utilities
	select(val = 0) {
		if (
			val < 0 ||
			(this.projects[this.project] !== undefined &&
				this.projects[this.project][val] !== undefined &&
				val > this.projects[this.project].length)
		)
			throw new TypeError(
				'Tab to select is not within the valid range. (size of the tabs array)'
			)
		this.selected = val

		if (this.getSelected()) {
			let sel = this.getSelected()

			//PLUGIN TRIGGER
			trigger(
				'bridge:changedTab',
				{
					file_path: sel.file_path,
					file_extension: path.extname(sel.file_path),
					file_type: FileType.get(sel.file_path),
				},
				true
			)
		}

		//UPDATE UI
		EventBus.trigger('updateSelectedTab')
	}
	selectNavigation(str_path: string, tab = this.selected) {
		if (
			!this.getSelected() ||
			this.projects[this.project][tab].file_navigation === str_path
		)
			return

		this.projects[this.project][tab].file_navigation = str_path
		EventBus.trigger('updateFileNavigation', str_path)

		try {
			trigger(
				'bridge:selectedNode',
				{ node: this.getSelected().content.get(str_path) },
				true
			)
		} catch (e) {}
	}
	setCurrentFileNav(val: string) {
		this.selectNavigation(val)
	}
	setCurrentContent(c: JSONTree | string) {
		this.getSelected().content = c
	}
	setTabCompiled(val: boolean) {
		this.getSelected().is_compiled = val
	}
	deleteCurrent() {
		let current = this.getSelected().content
		if (!(current instanceof JSONTree)) return

		let nav = this.getCurrentNavigation()
		if (current.isDataPath(nav)) {
			current.get(nav).edit('', true)
		} else {
			current.get(nav).remove(undefined, true)
		}

		this.navigationBack()
		this.setCurrentUnsaved()
	}
	deleteCurrentChildren() {
		let current = this.getSelected().content
		if (!(current instanceof JSONTree)) return
		let nav = this.getCurrentNavigation()

		if (current.isDataPath(nav)) {
			this.navigationBack()
		}
		current = current.get(nav)

		current.data = ''
		current.children = []

		this.setCurrentUnsaved()
	}
	setCurrentSaved() {
		if (this.getSelected().is_unsaved) {
			this.getSelected().is_unsaved = false
			EventBus.trigger('updateSelectedTabUI')
		}
	}
	setCurrentUnsaved() {
		if (!this.getSelected().is_unsaved) {
			this.getSelected().is_unsaved = true
			EventBus.trigger('updateSelectedTabUI')
		}
	}
	setCurrentInvalid() {
		this.getSelected().is_invalid = true
	}
	get use_tabs() {
		return Store.state.Settings.use_tabs
	}
	toggleCurrentNode() {
		try {
			this.getCurrentNavObj().toggleOpen()
		} catch (e) {}
	}

	async transformContent(
		c: string | JSONTree | Buffer | object,
		raw: any,
		toJSON = true,
		file_uuid?: string
	) {
		if (raw === c) return raw
		else if (typeof c === 'string')
			return await BridgeCore.beforeTextSave(c, this.getCurrentFilePath())
		else if (c instanceof JSONTree)
			return JSON.stringify(
				toJSON
					? await BridgeCore.beforeSave(
							Format.toJSON(c, true, false, true),
							undefined,
							undefined,
							undefined,
							file_uuid
					  )
					: c.buildForCache(),
				null,
				this.use_tabs ? '\t' : '  '
			)
		return JSON.stringify(c, null, this.use_tabs ? '\t' : '  ')
	}
	transformForCache(c: any, raw: any) {
		if (raw === c) return raw
		else if (typeof c === 'string') return c
		else if (c instanceof JSONTree) return c.buildForCache()
		return c
	}

	//SAVING
	async getSaveContent(current: any, update_cache = true) {
		let format_version: FormatVersion = 0
		if (current.content instanceof JSONTree) format_version = 1
		if (current.file_uuid === undefined) current.file_uuid = uuid()

		//bridgeCore needs to be triggered before caches are saved
		let data = await this.transformContent(
			current.content,
			current.raw_content,
			undefined,
			current.file_uuid
		)

		if (update_cache && OmegaCache.mayBeCached(current.file_path)) {
			await Promise.all([
				OmegaCache.save(current.file_path, {
					format_version,
					file_uuid: current.file_uuid,
					file_version: current.file_version,
					cache_content: this.transformForCache(
						current.content,
						current.raw_content
					),
				}),
				LightningCache.add(current.file_path, current.content),
			])
		}

		return data
	}
	async saveCurrent(
		fsMethod: 'basicSave' | 'basicSaveAs' = 'basicSave',
		update_cache = true
	) {
		let win = new LoadingWindow('save-file').show()
		trigger('bridge:startedSaving')
		let current = this.getSelected()
		if (
			current === undefined ||
			current.is_invalid ||
			current.is_immutable ||
			(!current.is_unsaved && fsMethod === 'basicSave')
		)
			return win.close()

		if (current.file_version === undefined) current.file_version = 0
		else current.file_version++

		//Load .no-cache file
		const shouldBeCached = await useCache(current.file_path)
		if (!shouldBeCached) {
			FileSystem[fsMethod](
				current.file_path,
				await this.getSaveContent(
					current,
					update_cache && shouldBeCached
				),
				false,
				false
			)
		} else {
			let comment_char = FileType.getCommentChar(current.file_path)
			FileSystem[fsMethod](
				current.file_path,
				`${comment_char}bridge-file-version: #${
					current.file_version
				}\n${await this.getSaveContent(
					current,
					update_cache && shouldBeCached
				)}`,
				false,
				false
			)
		}

		this.setCurrentSaved()
		win.close()
	}
	saveCurrentAs() {
		this.saveCurrent('basicSaveAs', false)
	}
	async saveAllScreen(split_screen = false) {
		let tabs = this.getCurrentProjects(split_screen)
		this.split_screen_active = split_screen

		for (let i = 0; i < tabs.length; i++) {
			if (tabs[i].is_unsaved) {
				this.select(i)
				await this.saveCurrent()
			}
		}
	}
	async saveAll() {
		let curr_selected = this.selected
		let s_active = this.split_screen_active
		let win = new LoadingWindow()

		await this.saveAllScreen(false)
		await this.saveAllScreen(true)

		win.close()
		this.split_screen_active = s_active
		this.selected = curr_selected
	}

	//MOVING & NAVIGATING
	moveCurrentUp() {
		let current = this.getCurrentNavObj()
		if (current === undefined || !(current instanceof JSONTree)) return

		if (!current.moveUp()) return
		EventBus.trigger('updateCurrentContent', this.getSelected().content)

		let old = this.getCurrentNavigation()
		this.setCurrentFileNav('global')
		this.setCurrentFileNav(old)

		this.setCurrentUnsaved()
	}
	moveCurrentDown() {
		let current = this.getCurrentNavObj()
		if (current === undefined || !(current instanceof JSONTree)) return

		if (!current.moveDown()) return
		EventBus.trigger('updateCurrentContent', this.getSelected().content)

		let old = this.getCurrentNavigation()
		this.setCurrentFileNav('global')
		this.setCurrentFileNav(old)

		this.setCurrentUnsaved()
	}
	moveSelectionUp() {
		let current = this.getCurrentNavObj()
		if (current === undefined || !(current instanceof JSONTree)) return
		let node = current.previous()
		this.setCurrentFileNav(node.path)
	}
	moveSelectionDown() {
		let current = this.getCurrentNavObj()
		if (current === undefined || !(current instanceof JSONTree)) return
		let node = current.next()
		this.setCurrentFileNav(node.path)
	}
}

export default new TabSystem()
