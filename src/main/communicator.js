import { ipcMain, app } from 'electron'
import { dialog } from 'electron'
import fs from 'fs'
import { DefaultDir } from '../shared/DefaultDir'

ipcMain.on('openFileDialog', (event, args) => {
	dialog.showOpenDialog(
		{
			title: 'Select a File',
			properties: ['openFile', 'multiSelections'],
		},
		file_paths => {
			if (file_paths)
				file_paths.forEach(path => event.sender.send('openFile', path))
		}
	)
})

ipcMain.on('saveAsFileDialog', (event, { path, content }) => {
	dialog.showSaveDialog(
		{ defaultPath: path.replace(/\//g, '\\') },
		file_path => {
			if (file_path) {
				fs.writeFile(file_path, content, err => {
					if (err) throw err
				})
			}
		}
	)
})

ipcMain.on('chooseDefaultDirectory', (event, args) => {
	dialog.showOpenDialog(
		{
			title: 'Select a Default Directory',
			properties: ['openDirectory'],
		},
		file_path => {
			if (file_path) {
				DefaultDir.set(file_path)
				app.relaunch()
				app.quit()
			}
		}
	)
})
