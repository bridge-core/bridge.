import { promises as fs, Dirent } from 'fs'
import { BP_BASE_PATH, MOJANG_PATH, CURRENT } from '../../../../constants'
import { join } from 'path'
import { LoadedProjects } from './definition'
import { readJSON } from '../../../../Utilities/JsonFS'
import Store from '../../../../../store/index'

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
	let {
		header: { version, name, description },
		metadata: { author } = { author: 'Unknown' },
	} = await readJSON(join(projectPath, 'manifest.json')).catch(() => ({
		header: {},
		metadata: {},
	}))

	if (description === 'pack.description') {
		try {
			const langFile = (
				await fs.readFile(join(projectPath, 'texts/en_US.lang'))
			).toString('utf-8')
			const lines = langFile.split('\n')

			for (let line of lines) {
				const [key, value] = line.split('=')
				if (key.trim() === 'pack.description')
					description = value.trim()
			}
		} catch {}
	}

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
