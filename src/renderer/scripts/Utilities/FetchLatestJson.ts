import * as VERSION_UTILS from './VersionUtils'
import { WEB_APP_DATA, APP_VERSION } from '../constants'
import { isUndefined } from 'util'

// new improved data!
export interface newVersionRes {
	description?: string
	latest_version?: string
	update_available?: boolean
	downloads?: number
	latest_version_name?: string
	urls?: Array<string>
}
// this ask the github's RESTful api for the bridge.'s latest release data
export default async function fetchLatestJson() {
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

			// Count the downloads + push the download url to the interface
			for (let asset of data.assets) {
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
