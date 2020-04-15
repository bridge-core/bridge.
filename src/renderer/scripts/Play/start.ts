import FileType from '../editor/FileType'
import { PlayState } from './state'

export function hasPlaySession(filePath: string) {
	return FileType.getData(filePath).player !== undefined
}

export function startPlaySession(filePath: string) {
	PlayState.player = FileType.getData(filePath).player

	PlayState.isVisible = true
}
