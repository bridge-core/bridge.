import { browser_window } from '../constants'

// online status, true = online false = offline
let status: boolean

// adds the listeners
export function startListening() {
	window.addEventListener('online', listener)
	window.addEventListener('offline', listener)
}
// listener
function listener(this: Window, ev: Event) {
	status = this.navigator.onLine
}

// use this to know if you're online or not
export default status

export async function downloadFile(file_url: string, path: string) {
	try {
		let contents = browser_window.webContents
		contents.downloadURL(file_url)
		contents.session.on('will-download', (event, item, webContents) => {
			event.preventDefault()
			// Set the save path, making Electron not to prompt a save dialog. i tried :C
			path = path + item.getFilename()
			console.log(path)
			item.savePath = path
			item.setSavePath(path)
			// set the icon's progress bar to 0
			browser_window.setProgressBar(0)
			// get total bytes
			let total = item.getTotalBytes(),
				filename = item.getFilename()
			item.on('updated', (event, state) => {
				if (state === 'progressing') {
					if (item.isPaused()) {
						// if its possible to resume the download, resume it
						if (item.canResume()) item.resume()
					} else {
						if (total != 0) {
							// update the progress bar
							let percentage =
								(item.getReceivedBytes() * 100) / total
							browser_window.setProgressBar(percentage)
						}
						// log recived bytes
						console.log(
							`Received bytes: ${item.getReceivedBytes()}`
						)
					}
				}
			})
			item.once('done', (event, state) => {
				if (state === 'completed') {
					// finished
					return filename
				} else {
					//an error occurred, throw it
					throw new Error(`${state}`)
				}
			})
		})
	} catch (e) {
		// in case thing go REALLY bad
		//console.log(e);
		throw new Error(e)
	}
}
