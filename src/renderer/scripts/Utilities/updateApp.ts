/**
 * @todo Automatically update bridge.
 * @todo Detect electron updates manually to force update with the installer
 */
import path from 'path'
import { platform, tmpdir } from 'os'
import { downloadFile } from './ConnectionStatus'
import LoadingWindow from '../../windows/LoadingWindow'
import { execFile } from 'child_process'
import { app } from 'electron'

export default async function updateApp(urls: Array<string>) {
	// log dev things
	console.log('running on: ' + platform())
	console.log('user tmpdir set to: ' + tmpdir())
	// useful variables
	let url: string
	let file_path = tmpdir + path.sep + 'bridge'
	let extension: string
	// create a loading window so the user know that there's a process working
	const lw = new LoadingWindow('com.enderzombi102.updateWindow')
	/*
    check the platform and take the url that download the correct installer
    and set the file's extension, this allow to reuse code
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
		// the user OS isn't supported by bridge or by the updater
		console.log('if this get executed, its bad')
		// close the cloading window
		lw.close()
		throw new Error(
			"ERROR! Your platform isn't supported by the auto updater, please update manually."
		)
	}
	// compose the file path
	file_path = file_path + extension
	// replace the url-version of @ for the symbol
	if (url.indexOf('%40') != -1) url = url.replace('%40', '@')
	// wait for the file to download
	await downloadFile(url, file_path)
	// execute the file
	execFile(file_path)
	// close the loading window
	lw.close()
	// close bridge.
	app.quit()
}
