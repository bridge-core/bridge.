import { createWindow } from '../../create'
import CreateFileHereComponent from './Main.vue'
import { FileExplorer } from '../../../Sidebar/FileExplorer'
import FileType from '../../../../editor/FileType'

export function createFileHereWindow(
	fileName: string,
	folderPath: string,
	fileExplorer: FileExplorer
) {
	const CreateFileHere = createWindow(CreateFileHereComponent, {
		fileName: fileName,
		folderPath: folderPath,
		fileExplorer: fileExplorer,
		fileExtensions: ['.json', '.mcfunction', '.js'],
		fileExtension:
			'.' +
			(FileType.getFileCreator(`${folderPath}/${fileName}`)?.extension ??
				'json'),
	})
	CreateFileHere.open()
	return CreateFileHere
}
