import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import './communicator'
import './Discord'
import { BP_BASE_PATH } from '../shared/Paths'
import { join } from 'path'
import MENU from './menuBuilder'
import fs from 'fs'
import { DATA_PATH } from '../shared/DefaultDir'

let SETTINGS = {}
try {
	SETTINGS = JSON.parse(
		fs.readFileSync(join(DATA_PATH, 'settings')).toString()
	)
} catch (e) {}

//Set __static path to static files in production
if (process.env.NODE_ENV !== 'development') {
	global.__static = require('path')
		.join(__dirname, '/static')
		.replace(/\\/g, '\\\\')
}

if (SETTINGS.disable_hardware_acceleration) {
	app.disableHardwareAcceleration()
}

let mainWindow,
	loadingWindow,
	windowOptions = {
		height: 600,
		useContentSize: true,
		width: 1080,
		frame: process.platform === 'darwin',
		minWidth: 1080,
		minHeight: 600,
		show: false,
		webPreferences: {
			nodeIntegration: true,
		},
	}
const winURL =
	process.env.NODE_ENV === 'development'
		? `http://localhost:9080`
		: `file://${__dirname}/index.html`

function createWindow() {
	/**
	 * Initial window options
	 */
	mainWindow = new BrowserWindow(windowOptions)

	mainWindow.loadURL(winURL)

	mainWindow.on('closed', () => {
		mainWindow = null
		if (loadingWindow) {
			loadingWindow.close()
		}
	})

	mainWindow.webContents.on('did-finish-load', () => {
		if (loadingWindow) {
			mainWindow.setPosition(...loadingWindow.getPosition())
			loadingWindow.close()
			mainWindow.show()
		}
	})

	if (MENU === null) mainWindow.removeMenu()
	else mainWindow.setMenu(Menu.buildFromTemplate(MENU))
}

function createSplashScreen() {
	loadingWindow = new BrowserWindow({
		height: 300,
		useContentSize: true,
		width: 300,
		frame: process.platform === 'darwin',
		resizable: false,
		webPreferences: {
			nodeIntegration: true,
		},
	})

	loadingWindow.loadURL(`file://${__static}/loading.html`)

	loadingWindow.on('closed', () => {
		loadingWindow = null
	})

	loadingWindow.webContents.on('did-finish-load', () => {
		loadingWindow.show()
	})
}

app.on('ready', () => {
	createWindow()
	createSplashScreen()
})

app.on('window-all-closed', () => {
	app.quit()
})

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow()
	}
})

ipcMain.on('toggleDevTools', () => {
	mainWindow.toggleDevTools()
})
ipcMain.on('bridge:setOverlayIcon', (event, project) => {
	try {
		mainWindow.setOverlayIcon(
			join(BP_BASE_PATH, project, '/pack_icon.png'),
			project
		)
	} catch (e) {
		mainWindow.setOverlayIcon(null, '')
	}
})
