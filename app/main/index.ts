import { app, BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
import { autoUpdater } from 'electron-updater'
import { setup } from './API'

declare const __static: string

//Set __static path to static files in production
if (process.env.NODE_ENV !== 'development') {
	global.__static = require('path')
		.join(__dirname, '/static')
		.replace(/\\/g, '\\\\')
}

let mainWindow: BrowserWindow | null,
	loadingWindow: BrowserWindow | null,
	windowOptions: BrowserWindowConstructorOptions = {
		height: 600,
		useContentSize: true,
		width: 1080,
		frame: process.platform === 'darwin',
		minWidth: 1080,
		minHeight: 600,
		show: false,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false,
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
		if (loadingWindow && mainWindow) {
			mainWindow.setPosition(
				...(loadingWindow.getPosition() as [number, number])
			)
			loadingWindow.close()
			mainWindow.show()

			if (process.env.NODE_ENV === 'development')
				mainWindow.webContents.toggleDevTools()

			autoUpdater.checkForUpdatesAndNotify()
			setup({ mainWindow })
		}
	})

	mainWindow.removeMenu()
}

function createSplashScreen() {
	loadingWindow = new BrowserWindow({
		height: 300,
		useContentSize: true,
		width: 300,
		frame: process.platform === 'darwin',
		resizable: true,
		webPreferences: {
			webSecurity: false,
			nodeIntegration: true,
		},
	})
	loadingWindow.loadURL(`file://${global.__static ?? __static}/loading.html`)

	loadingWindow.on('closed', () => {
		loadingWindow = null
	})

	loadingWindow.webContents.on('did-finish-load', () => {
		if (loadingWindow) loadingWindow.show()
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
