import { createWindow } from '../create'
import UpdateAppComponent from './Main.vue'
import { newVersionRes } from '../../../Utilities/updateApp'
import { WEB_APP_DATA } from '../../../constants'
import { Marked } from '@ts-stack/markdown'
import { IDisposable } from '../../../Types/disposable'

export function createUpdateAppWindow(
	{
		description,
		latest_version,
		downloads,
		latest_version_name,
		download_available,
		urls,
	}: newVersionRes,
	notification: IDisposable
) {
	// Check if there's an update name, if not, add a generic "update available"
	if (!latest_version_name.includes('-')) {
		latest_version_name = latest_version.concat(' - Update Available')
	}
	const UpdateApp = createWindow(UpdateAppComponent, {
		updateDesc: Marked.parse(description),
		latestVersion: latest_version,
		downloads: downloads,
		latestVersionName: latest_version_name,
		imgSrc: WEB_APP_DATA + 'update_splash.png',
		isFullscreen: false,
		urls: urls,
		downloadAvailable: download_available,
		notification: notification,
	})
	UpdateApp.open()
	return UpdateApp
}
