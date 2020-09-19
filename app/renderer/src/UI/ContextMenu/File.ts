/**
 * Define context menu upon right clicking on a file (FileDisplayer.vue)
 */
import ManageFileMasks from '../../../windows/FileMasks'
import FileSystem from '../../FileSystem'
import trash from 'trash'
import TabSystem from '../../TabSystem'
import { promises as fs } from 'fs'
import path from 'path'
import { FileExplorer } from '../Sidebar/FileExplorer'
import FileInspector from '../../../windows/FileInspector'
import { readJSON } from '../../Utilities/JsonFS'
import Manifest from '../../files/Manifest'
import { writeJSON } from 'fs-extra'
import { shell } from 'electron'
import {
	createInputWindow,
	createConfirmWindow,
} from '../Windows/Common/CommonDefinitions'

export const FILE_CONTEXT_MENU = async (
	file_path: string,
	file: FileExplorer,
	isImmutable = false
) => {
	const fileName = path.basename(file_path)
	const openInSplitScreen = {
		title: 'Open to the Side',
		icon: 'mdi-arrow-split-vertical',
		action: () => {
			TabSystem.split_screen_active = true
			FileSystem.open(file_path)
		},
	}

	if (isImmutable) return [openInSplitScreen]

	const DEFAULT_MENU = [
		openInSplitScreen,
		{
			title: 'Reveal in File Explorer',
			icon: 'mdi-folder-search',
			action: () => shell.showItemInFolder(file_path),
		},
		{ type: 'divider' },
		{
			title: 'Delete',
			icon: 'mdi-delete',
			action: () => {
				createConfirmWindow(
					`Are you sure that you want to delete "${path
						.basename(file_path)
						.replace(/\\/g, '/')}"?`,
					'Delete',
					'Cancel',
					async () => {
						await trash(file_path)
						file.remove()
					},
					() => {}
				)
			},
		},
		{
			title: 'Rename',
			icon: 'mdi-pencil',
			action: () => {
				createInputWindow(
					'Name Input',
					'Name',
					path.basename(file_path, path.extname(file_path)),
					path.extname(file_path),
					async new_name => {
						const CLOSED = TabSystem.closeByPath(file_path)
						const newPath = path.join(
							path.dirname(file_path),
							path.dirname(new_name),
							path.basename(new_name)
						)

						await fs.mkdir(path.dirname(newPath), {
							recursive: true,
						})
						await fs.rename(file_path, newPath)

						await file.update(
							newPath,
							path.join(
								path.dirname(file.path),
								path.dirname(new_name),
								path.basename(new_name)
							)
						)
						await file.parent.refresh()

						if (CLOSED) FileSystem.open(newPath)
					}
				)
			},
		},
		{
			title: 'Duplicate',
			icon: 'mdi-content-duplicate',
			action: () => {
				createInputWindow(
					'Name Input',
					'Name',
					path.basename(file_path, path.extname(file_path)),
					path.extname(file_path),
					new_name => file.duplicate(new_name)
				)
			},
		},
		{ type: 'divider' },
		{
			title: 'File Layers',
			icon: 'mdi-layers',
			action: () => {
				new ManageFileMasks(file_path)
			},
		},
		{
			title: 'File Inspector',
			icon: 'mdi-magnify',
			action: () => {
				new FileInspector(file_path)
			},
		},
	]

	/**
	 * QUICK ACTION TO TOGGLE CLIENT SCRIPTS
	 */
	if (fileName === 'manifest.json') {
		if (Manifest.getPackFolder(file_path) === 'development_behavior_packs') {
			let manifest: Manifest = await readJSON(file_path).catch(console.error)
			if (Manifest.hasClientData(manifest)) {
				DEFAULT_MENU.push({
					title: 'Remove Client Scripts',
					icon: 'mdi-minus',
					action: () => {
						Manifest.removeClientData(manifest)
						writeJSON(file_path, manifest)
					},
				})
			} else {
				DEFAULT_MENU.push({
					title: 'Add Client Scripts',
					icon: 'mdi-plus',
					action: () => {
						Manifest.addClientData(manifest)
						writeJSON(file_path, manifest)
					},
				})
			}
		}
	}

	return DEFAULT_MENU
}
