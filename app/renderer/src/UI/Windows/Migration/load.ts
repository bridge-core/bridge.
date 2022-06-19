import { promises as fs } from 'fs'
import { BP_BASE_PATH } from '../../../constants'

export async function loadProjects() {
	const packs = await fs.readdir(BP_BASE_PATH, {
		withFileTypes: true,
	})
	return packs
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name)
}
