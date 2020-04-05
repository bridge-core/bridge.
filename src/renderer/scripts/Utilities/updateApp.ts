/**
 * @todo Automatically update bridge.
 * @todo Detect electron updates manually to force update with the installer
 */
import path from 'path'
import { platform, tmpdir } from 'os'
import LoadingWindow from '../../windows/LoadingWindow'
import { ipcRenderer, shell } from 'electron'

export default async function updateApp(urls: Array<string>) {
	// Log dev things
	console.log('Running on: ' + platform())
	console.log('User tmpdir set to: ' + tmpdir())
	// Variables
	let url: string
	let file_path = path.join(tmpdir(), 'bridge')
	let extension: string

	// Create a loading window so the user know that there's a process working
	const lw = new LoadingWindow()

	/**
	 * Check the platform and take the url which downloads the correct installer
	 * Also sets the file's extension to reuse later
	 */
	if (platform() == 'darwin') {
		for (let i in urls) {
			if (urls[i].indexOf('.dmg') != -1) url = urls[i]
			extension = '.dmg'
		}
	} else if (platform() == 'win32') {
		for (let i in urls) {
			if (urls[i].indexOf('.exe') != -1) url = urls[i]
			extension = '.exe'
		}
	} else if (platform() == 'linux') {
		for (let i in urls) {
			if (urls[i].indexOf('.AppImage') != -1) url = urls[i]
			extension = '.AppImage'
		}
	} else {
		// User's OS isn't supported by the update
		lw.close() // Close the loading window
		shell.openExternal(
			'https://github.com/bridge-core/bridge./releases/latest'
		)
	}
	// Compose the file path
	file_path = file_path + extension

	await ipcRenderer.invoke('bridge:downloadUpdate', url, file_path)
}
