import { promises as fs, Dirent } from 'fs'
import { BP_BASE_PATH, MOJANG_PATH } from '../../constants'
import { join } from 'path'
import { LoadedProjects } from './state'
import { readJSON } from '../../Utilities/JsonFS'
import Store from '../../../store/index'

export async function loadProjects() {
	// Remove old data
	LoadedProjects.splice(0, LoadedProjects.length)

	const devBehaviorFolders = (
		await fs.readdir(BP_BASE_PATH, {
			withFileTypes: true,
		})
	)
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name)

	const worldPacks = Store.state.Settings.load_packs_from_worlds
		? await loadWorldPacks()
		: []

	LoadedProjects.push(
		...(await Promise.all(
			devBehaviorFolders.concat(worldPacks).map(async folder => {
				const projectPath = join(BP_BASE_PATH, folder)

				return {
					relativeProjectPath: folder,
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

async function loadWorldPacks() {
	let mapPacks: Dirent[] = []
	try {
		mapPacks = await fs.readdir(join(MOJANG_PATH, 'minecraftWorlds'), {
			withFileTypes: true,
		})
	} catch {}
	return (
		await Promise.all(
			mapPacks.map(async dirent => {
				try {
					return (
						await fs.readdir(
							join(
								MOJANG_PATH,
								'minecraftWorlds',
								dirent.name,
								'behavior_packs'
							),
							{
								withFileTypes: true,
							}
						)
					)
						.filter(nestedDirent => nestedDirent.isDirectory())
						.map(nestedDirent =>
							join(
								'../minecraftWorlds',
								dirent.name,
								'behavior_packs',
								nestedDirent.name
							)
						)
				} catch {
					return []
				}
			})
		)
	).flat()
}
