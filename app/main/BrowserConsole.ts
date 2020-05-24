import { BrowserWindow } from 'electron'

export function log(data: unknown, browserWindow?: BrowserWindow) {
	if (browserWindow) browserWindow.webContents.send('bridge:consoleLog', data)
	else console.log(data)
}

export function warn(data: unknown, browserWindow?: BrowserWindow) {
	if (browserWindow)
		browserWindow.webContents.send('bridge:consoleWarn', data)
	else console.warn(data)
}

export function error(data: unknown, browserWindow?: BrowserWindow) {
	if (browserWindow)
		browserWindow.webContents.send('bridge:consoleError', data)
	else console.error(data)
}
