import { ipcMain } from 'electron'

let COLLECTED_LOGS: {
	type?: 'error' | 'warn' | 'default'
	data: unknown
}[] = []

export function log(data: unknown) {
	COLLECTED_LOGS.push({ data })
}

export function warn(data: unknown) {
	COLLECTED_LOGS.push({ type: 'warn', data })
}

export function error(data: unknown) {
	COLLECTED_LOGS.push({ type: 'error', data })
}

ipcMain.handle('bridge:requestMainThreadLogs', () => {
	const tmp = COLLECTED_LOGS
	COLLECTED_LOGS = []
	return tmp
})
