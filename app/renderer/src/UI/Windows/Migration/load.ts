import { promises as fs } from 'fs'
import { BP_BASE_PATH } from '../../../constants'

export async function loadProjects() {
	const devBehaviorFolders = (
		await fs.readdir(BP_BASE_PATH, {
			withFileTypes: true,
		})
	)
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name)

	return devBehaviorFolders
}
