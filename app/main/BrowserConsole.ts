import { BrowserWindow } from 'electron'

export function log(data: unknown, browserWindow?: BrowserWindow) {
	if (browserWindow) browserWindow.webContents.send('bridge:consoleLog', data)
	console.log(data)
}

export function warn(data: unknown, browserWindow?: BrowserWindow) {
	if (browserWindow)
		browserWindow.webContents.send('bridge:consoleWarn', data)
	console.warn(data)
}

export function error(data: unknown, browserWindow?: BrowserWindow) {
	if (browserWindow)
		browserWindow.webContents.send('bridge:consoleError', data)
	console.error(data)
}
