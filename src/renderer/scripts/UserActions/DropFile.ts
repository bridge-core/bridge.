import LoadingWindow from '../../windows/LoadingWindow'
import FileSystem from '../FileSystem'

document.addEventListener('dragover', event => {
	event.preventDefault()
})
document.addEventListener('drop', async event => {
	event.preventDefault()
	let files = Array.from(event.dataTransfer.files)

	if (files.length === 0) return
	let win: LoadingWindow = new LoadingWindow().show()

	await Promise.all(files.map(async file => await FileSystem.open(file.path)))

	win.close()
})
