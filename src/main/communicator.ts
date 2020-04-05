import { ipcMain, app, BrowserWindow } from 'electron'
import { dialog } from 'electron'
import fs from 'fs'
import { DefaultDir } from '../shared/DefaultDir'
import { execFile } from 'child_process'
import { download } from 'electron-dl'
import path from 'path'

ipcMain.on('openFileDialog', async (event, args) => {
	let { filePaths, canceled } = await dialog.showOpenDialog({
		title: 'Select a File',
		properties: ['openFile', 'multiSelections'],
	})

	if (!canceled)
		filePaths.forEach(path => event.sender.send('openFile', path))
})

ipcMain.on('saveAsFileDialog', async (event, { path, content }) => {
	let { filePath, canceled } = await dialog.showSaveDialog({
		defaultPath: path.replace(/\//g, '\\'),
	})

	if (!canceled)
		fs.writeFile(filePath, content, err => {
			if (err) throw err
		})
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

ipcMain.handle('bridge:downloadUpdate', async (event, file_url, file_path) => {
	await download(BrowserWindow.getFocusedWindow(), file_url, {
		filename: path.basename(file_path),
		directory: path.dirname(file_path),
	})
	execFile(file_path)
})
