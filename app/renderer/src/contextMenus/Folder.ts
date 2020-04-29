/**
 * Define context menu upon right clicking on a folder (FileDisplayer.vue)
 */
import ConfirmWindow from '../commonWindows/Confirm'
import InputWindow from '../commonWindows/Input'
import trash from 'trash'
import { promises as fs } from 'fs'
import path from 'path'
import { FileExplorer } from '../Sidebar/FileExplorer'
import CreateFileHereWindow from '../../windows/CreateFileHere'
import { shell } from 'electron'

export const FOLDER_CONTEXT_MENU = (file_path: string, file: FileExplorer) => [
	{
		title: 'Reveal in File Explorer',
		icon: 'mdi-folder-search',
		action: () => shell.showItemInFolder(file_path),
	},
	{
		type: 'divider',
	},
	{
		title: 'Delete',
		icon: 'mdi-delete',
		action: () => {
			new ConfirmWindow(
				async () => {
					await trash(file_path)
					await file.remove()
				},
				() => {},
				`Are you sure that you want to delete "${path
					.basename(file_path)
					.replace(/\\/g, '/')}"?`,
				{
					options: {
						is_persistent: false,
					},
				}
			)
		},
	},
	{
		title: 'New Folder',
		icon: 'mdi-folder-plus',
		action: () => {
			new InputWindow(
				{
					text: '',
					label: 'Name',
					header: 'Name Input',
				},
				async name => {
					await fs.mkdir(path.join(file_path, name), {
						recursive: true,
					})

					let curr_file = file
					name.split(/\\|\//g).forEach(folder => {
						let tmp = new FileExplorer(
							file,
							path.join(file.path, folder),
							path.join(file_path, folder),
							true,
							true
						)
						curr_file.children.push(tmp)
						curr_file.sort()
						curr_file = tmp
					})
				}
			)
		},
	},
	{
		type: 'divider',
	},
	{
		title: 'Create File Here',
		icon: 'mdi-file-plus',
		action: () => {
			new CreateFileHereWindow('unknown', file_path, file)
		},
	},
]
