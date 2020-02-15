import * as VERSION_UTILS from './VersionUtils'
import { WEB_APP_DATA, APP_VERSION } from '../constants'

export interface fetchVersionRes {
	latest_version?: string
	update_available?: boolean
}

export default async function fetchLatestVersion() {
	let res: fetchVersionRes = {}
	await fetch(WEB_APP_DATA + 'app.json')
		.then(data => data.json())
		.then(({ latest_version }) => {
			console.log(
				`Running bridge. ${APP_VERSION} | Latest: ${latest_version}`
			)
			res = { latest_version }
			res.update_available = VERSION_UTILS.lessThan(
				APP_VERSION,
				latest_version
			)
		})
		.catch(() => {
			console.log(
				`Running bridge. ${APP_VERSION} | Unable to get latest version`
			)
			res.update_available = false
		})

	return res
}
