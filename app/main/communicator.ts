import {
	ipcMain,
	app,
	BrowserWindow,
	shell,
	FileFilter,
	OpenDialogOptions,
} from 'electron'
import { dialog } from 'electron'
import { promises as fs } from 'fs'
import { DefaultDir } from '../shared/DefaultDir'
import { download } from 'electron-dl'
import path from 'path'

ipcMain.handle(
	'openFileDialog',
	async (
		event,
		{
			filters,
			properties,
		}: {
			properties?: OpenDialogOptions['properties']
			filters?: FileFilter[]
		} = {}
	) => {
		let { filePaths, canceled } = await dialog.showOpenDialog({
			title: 'Select a File',
			properties: <OpenDialogOptions['properties']>(
				['openFile'].concat(properties ?? [])
			),
			filters,
		})

		if (canceled) return []
		return filePaths
	}
)

ipcMain.handle('saveAsFileDialog', async (event, { path, content }) => {
	let { filePath, canceled } = await dialog.showSaveDialog({
		defaultPath: path.replace(/\//g, '\\'),
	})

	if (canceled) return false

	await fs.writeFile(filePath, content)
	return true
})

ipcMain.on('chooseDefaultDirectory', async (event, args) => {
	let { filePaths, canceled } = await dialog.showOpenDialog({
		title: 'Select a Default Directory',
		properties: ['openDirectory'],
	})

	if (!canceled && filePaths[0] !== undefined) {
		DefaultDir.set(filePaths[0])
		app.relaunch()
		app.quit()
	}
})

ipcMain.handle('bridge:closeApp', () => {
	app.quit()
})

ipcMain.handle('bridge:installUpdate', async (event, file_url, file_path) => {
	await download(BrowserWindow.getFocusedWindow(), file_url, {
		filename: path.basename(file_path),
		directory: path.dirname(file_path),
	})

	shell.openItem(file_path)
	app.quit()
})

ipcMain.handle('bridge:downloadFile', async (event, file_url, file_path) => {
	await download(BrowserWindow.getFocusedWindow(), file_url, {
		filename: path.basename(file_path),
		directory: path.dirname(file_path),
	})
})

ipcMain.on('bridge:reloadWindow', () => {
	BrowserWindow.getFocusedWindow().reload()
})
