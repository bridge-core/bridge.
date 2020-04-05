import path from 'path'
import { platform, tmpdir } from 'os'
import LoadingWindow from '../../windows/LoadingWindow'
import { ipcRenderer, shell } from 'electron'

export default async function updateApp(urls: Array<string>) {
	let file_path = path.join(tmpdir(), 'bridge-update')
	let extension = ''

	// Create a loading window so the user know that there's a process working
	const lw = new LoadingWindow()

	/**
	 * Check the platform and take the url which downloads the correct installer
	 * Also sets the file's extension to reuse later
	 */
	switch (platform()) {
		case 'darwin': {
			extension = '.dmg'
			break
		}
		case 'win32': {
			extension = '.exe'
			break
		}
		case 'linux': {
			extension = '.AppImage'
			break
		}
		default: {
			// User's OS isn't supported by the updater
			lw.close() // Close the loading window
			shell.openExternal(
				'https://github.com/bridge-core/bridge./releases/latest'
			)
			return
		}
	}

	let file_url = urls.find(url => url.endsWith(extension))
	// Compose the file path
	file_path = file_path + extension

	await ipcRenderer.invoke('bridge:downloadUpdate', file_url, file_path)
}
