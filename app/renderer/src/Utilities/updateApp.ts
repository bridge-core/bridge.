import path from 'path'
import { platform, tmpdir } from 'os'
import LoadingWindow from '../../windows/LoadingWindow'
import { ipcRenderer, shell } from 'electron'
import * as VERSION_UTILS from './VersionUtils'
import { APP_VERSION } from '../constants'

export async function updateApp(urls: Array<string>) {
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

	await ipcRenderer.invoke('bridge:installUpdate', file_url, file_path)
}
export interface newVersionRes {
	description?: string
	latest_version?: string
	update_available?: boolean
	downloads?: number
	latest_version_name?: string
	urls?: Array<string>
	download_available?: boolean
}
export async function fetchLatestJson() {
	let res: newVersionRes = {}

	await fetch(
		'https://api.github.com/repos/bridge-core/bridge./releases/latest'
	)
		.then(data => data.json())
		.then(data => {
			// Log bridge. infos
			console.log(
				`Running bridge. ${APP_VERSION} | Latest: ${data.tag_name}`
			)

			// Set interface data
			res.latest_version = data.tag_name
			res.description = String(data.body)
			res.downloads = 0
			res.urls = Array<string>()
			res.latest_version_name = data.name
			res.update_available = VERSION_UTILS.lessThan(
				APP_VERSION,
				data.tag_name
			)
			// find the correct file extension
			let extension: String
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
					break
				}
			}
			// Count the downloads + push the download url to the interface + check if the user's platform download is present
			for (let asset of data.assets) {
				if (asset.name.endsWith(extension))
					res.download_available = true
				res.downloads += Number(asset.download_count)
				res.urls.push(String(asset.browser_download_url))
			}
		})
		.catch(e => {
			// Failed to fetch > cannot update
			console.log(
				`Running bridge. ${APP_VERSION} | Unable to get latest version`
			)
			console.log(e)
			res.update_available = false
		})
	// Return the interface's data
	return res
}
