import path from 'path'
import LoadingWindow from '../../windows/LoadingWindow'
import { ipcRenderer, app } from 'electron'

export default async function updateApp(url: string) {
	// Create a loading window so the user know that there's a process working
	const lw = new LoadingWindow()
	await ipcRenderer.invoke('bridge:installUpdate', url)
	lw.close()
}
