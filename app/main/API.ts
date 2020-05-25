import {
	ipcMain,
	app,
	BrowserWindow,
	shell,
	FileFilter,
	OpenDialogOptions,
} from 'electron'
import { dialog } from 'electron'
import fs from 'fs'
import { DefaultDir } from '../shared/DefaultDir'
import { download } from 'electron-dl'
import path, { join } from 'path'
import { log, error } from './BrowserConsole'
import https from 'https'

export interface ISetupConfig {
	mainWindow: BrowserWindow
}

export function setup({ mainWindow }: ISetupConfig) {
	ipcMain.handle('bridge:toggleDevTools', () => {
		mainWindow.webContents.toggleDevTools()
	})

	ipcMain.handle(
		'openFileDialog',
		async (
			_,
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

	ipcMain.on('saveAsFileDialog', async (_, { path, content }) => {
		let { filePath, canceled } = await dialog.showSaveDialog({
			defaultPath: path.replace(/\//g, '\\'),
		})

		if (!canceled)
			fs.writeFile(filePath, content, err => {
				if (err) throw err
			})
	})

	ipcMain.on('chooseDefaultDirectory', async (_, args) => {
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

	ipcMain.handle('bridge:installUpdate', async (event, url: string) => {
		log('Starting download...', mainWindow)
		const appPath = app.getAppPath()
		// const appPath =
		'C:\\Users\\bened\\AppData\\Local\\Programs\\bridge\\resources\\app.asar'
		log(appPath, mainWindow)
		log(url, mainWindow)

		await download(mainWindow, url, {
			filename: path.basename(appPath),
			directory: path.dirname(appPath),
		})

		app.relaunch()
		app.quit()
	})

	ipcMain.handle('bridge:downloadFile', async (event, url, filePath) => {
		await download(mainWindow, url, {
			filename: path.basename(filePath),
			directory: path.dirname(filePath),
		})
	})

	ipcMain.on('bridge:reloadWindow', () => {
		mainWindow.reload()
	})
}
