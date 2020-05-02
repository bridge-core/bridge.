import * as VERSION_UTILS from './VersionUtils'
import { APP_VERSION } from '../constants'

// new improved data!
export interface newVersionRes {
	description?: string
	latest_version?: string
	update_available?: boolean
	downloads?: number
	latest_version_name?: string
	url?: string
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
			res.url = String()
			res.latest_version_name = data.name
			res.update_available = VERSION_UTILS.lessThan(
				APP_VERSION,
				data.tag_name
			)

			// Count the downloads + push the download url to the interface + check if the user's platform download is present
			for (let asset of data.assets) {
				res.downloads += Number(asset.download_count)
				if (asset.name.includes('.asar')) {
					res.url = asset.browser_download_url
				}
			}
			console.log('Latest version download url: ' + res.url)
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
