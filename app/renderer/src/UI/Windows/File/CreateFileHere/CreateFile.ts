import LoadingWindow from '../../../../../windows/LoadingWindow'
import { promises as fs } from 'fs'
import { join } from 'path'
import { FileExplorer } from '../../../Sidebar/FileExplorer'

export async function createFile(
	fileName: string,
	folderPath: string,
	fileExtension: string,
	fileExplorer: FileExplorer
) {
	let lw = new LoadingWindow()

	await fs.writeFile(join(folderPath, fileName + fileExtension), '')
	fileExplorer.refresh()

	lw.close()
}
