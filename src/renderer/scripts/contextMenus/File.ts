/**
 * Define context menu upon right clicking on a file (FileDisplayer.vue)
 */
import ManageFileMasks from '../../windows/FileMasks'
import FileSystem from '../FileSystem'
import ConfirmWindow from '../commonWindows/Confirm'
import InputWindow from '../commonWindows/Input'
import trash from 'trash'
import TabSystem from '../TabSystem'
import { promises as fs } from 'fs'
import OmegaCache from '../editor/OmegaCache'
import LightningCache from '../editor/LightningCache'
import { JSONFileMasks } from '../editor/JSONFileMasks'
import path from 'path'
import { FileExplorer } from '../Sidebar/FileExplorer'
import FileInspector from '../../windows/FileInspector'
import { readJSON } from '../Utilities/JsonFS'
import Manifest from '../files/Manifest'
import { writeJSON } from 'fs-extra'
import { shell } from 'electron'

export const FILE_CONTEXT_MENU = async (
	file_path: string,
	file: FileExplorer
) => {
	const file_name = path.basename(file_path)
	const DEFAULT_MENU = [
		{
			title: 'Open to the Side',
			icon: 'mdi-arrow-split-vertical',
			action: () => {
				TabSystem.split_screen_active = true
				FileSystem.open(file_path)
			},
		},
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
				new ConfirmWindow(
					async () => {
						await trash(file_path)
						file.remove()
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
			title: 'Rename',
			icon: 'mdi-pencil',
			action: () => {
				new InputWindow(
					{
						text: path.basename(file_path, path.extname(file_path)),
						label: 'Name',
						header: 'Name Input',
						expand_text: path.extname(file_path),
					},
					async (new_name: string) => {
						const CLOSED = TabSystem.closeByPath(file_path)
						const NEW_PATH = path.join(
							path.dirname(file_path),
							path.dirname(new_name),
							path.basename(new_name)
						)

						await fs.mkdir(path.dirname(NEW_PATH), {
							recursive: true,
						})
						await fs.rename(file_path, NEW_PATH)
						await file.update(
							NEW_PATH,
							path.join(
								path.dirname(file.path),
								path.dirname(new_name),
								path.basename(new_name)
							)
						)
						await file.parent.refresh()

						if (CLOSED) FileSystem.open(NEW_PATH)
					}
				)
			},
		},
		{
			title: 'Duplicate',
			icon: 'mdi-content-duplicate',
			action: () => {
				new InputWindow(
					{
						text: path.basename(file_path, path.extname(file_path)),
						label: 'Name',
						header: 'Name Input',
						expand_text: path.extname(file_path),
					},
					(new_name: string) => file.duplicate(new_name)
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
	if (file_name === 'manifest.json') {
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

	return DEFAULT_MENU
}
