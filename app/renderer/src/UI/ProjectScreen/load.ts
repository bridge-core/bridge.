import { promises as fs } from 'fs'
import { BP_BASE_PATH } from '../../constants'
import { join } from 'path'
import { LoadedProjects } from './state'
import { readJSON } from '../../Utilities/JsonFS'

export async function loadProjects() {
	const devBehaviorFolders = await fs.readdir(BP_BASE_PATH)

	LoadedProjects.push(
		...(await Promise.all(
			devBehaviorFolders.map(async folder => {
				const projectPath = join(BP_BASE_PATH, folder)

				return {
					projectPath,
					...(await loadManifest(projectPath)),
				}
			})
		))
	)
}

async function loadManifest(projectPath: string) {
	const {
		header: { version, name, description },
		metadata: { author } = { author: 'Unknown' },
	} = await readJSON(join(projectPath, 'manifest.json')).catch(() => ({
		header: {},
		metadata: {},
	}))

	return {
		version,
		name,
		author,
		description,
	}
}
