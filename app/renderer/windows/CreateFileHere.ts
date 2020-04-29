import Store from '../store/index'
import uuid from 'uuid/v4'
import { WindowDefinition } from '../scripts/commonWindows/ContentTypes'
import FileType from '../scripts/editor/FileType'
import { promises as fs } from 'fs'
import { join } from 'path'
import LoadingWindow from './LoadingWindow'
import { FileExplorer } from '../scripts/Sidebar/FileExplorer'

const EXPAND_OPTIONS = ['.json', '.mcfunction', '.js']

export default class CreateFileHereWindow {
	id: string
	input: string
	actions: any[]
	content: any[]
	expand_text: string
	file_explorer: FileExplorer

	constructor(
		file_name: string,
		folder_path: string,
		file_explorer: FileExplorer
	) {
		this.file_explorer = file_explorer
		this.expand_text =
			'.' +
			(FileType.getFileCreator(`${folder_path}/${file_name}`)
				?.extension ?? 'json')

		this.id = uuid()
		this.input = file_name || ''
		const CONFIRM_BTN = {
			type: 'button',
			text: 'Confirm',
			color: 'primary',
			is_rounded: false,
			is_disabled: file_name === '',
			action: () => {
				this.close()
				this.createFile(this.input, folder_path)
			},
		}
		const INPUT = {
			type: 'input',

			text: 'File Name',
			input: file_name,
			has_focus: true,
			action: {
				enter: () => {
					if (this.input === '') return
					this.close()
					this.createFile(this.input, folder_path)
				},
				default: (val: string) => {
					if (val === '') {
						this.input = val
						INPUT.input = val

						CONFIRM_BTN.is_disabled = true
						this.update({
							actions: this.actions,
							content: this.content,
						})
					} else if (this.input === '' && val !== '') {
						this.input = val
						INPUT.input = val

						CONFIRM_BTN.is_disabled = false
						this.update({
							actions: this.actions,
							content: this.content,
						})
					} else {
						this.input = val
					}
				},
			},
		}

		this.actions = [
			{
				type: 'space',
			},
			{
				type: 'button',
				text: 'Cancel',
				is_rounded: false,
				action: () => {
					this.close()
				},
			},
			CONFIRM_BTN,
		]
		this.content = [
			{
				text: '\n',
			},
			{
				type: 'big-header',
				text: 'Create File Here',
			},
			{
				type: 'divider',
			},
			{
				text: '\n',
			},
			{
				type: 'horizontal',
				center: true,
				content: [
					INPUT,
					{
						type: 'select',
						options: EXPAND_OPTIONS,
						input: this.expand_text,
						action: (val: string) => (this.expand_text = val),
					},
				],
			},
		]

		Store.commit('addPluginWindow', {
			actions: this.actions,
			content: this.content,
			options: {
				is_frameless: true,
				height: 160,
				is_persistent: false,
			},
			is_visible: true,
			id: this.id,
			onClose: () => this.close(),
		})
	}

	async createFile(file_name: string, folder_path: string) {
		let lw = new LoadingWindow()

		await fs.writeFile(join(folder_path, file_name + this.expand_text), '')
		this.file_explorer.refresh()

		lw.close()
	}

	update(opts: WindowDefinition) {
		Store.commit('updatePluginWindow', { ...opts, id: this.id })
		return this
	}

	close() {
		Store.commit('removePluginWindow', this.id)
		return this
	}
}
