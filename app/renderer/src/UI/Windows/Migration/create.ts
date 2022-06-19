import { promises as fs, createReadStream } from 'fs'
import { join } from 'path'
import { BP_BASE_PATH, RP_BASE_PATH } from '../../../../../shared/Paths'
import { readJSON, writeJSON } from '../../../Utilities/JsonFS'
import unzipper from 'unzipper'
import { findRP } from './findLinkedRP'
import { MinecraftManifest } from '../../../Project/Manifest/types'
import { transferProject } from './transferProject'

function updateConfig(
	config: any,
	bpManifest: any,
	projectName: string,
	lang: string,
	hasRP: boolean
) {
	let newConfig: any = {
		type: 'minecraftBedrock',
		packs: {
			behaviorPack: './BP',
			resourcePack: hasRP ? './RP' : undefined,
		},
		bridge: {
			v1CompatMode: true,
		},
		compiler: {
			plugins: [
				'typeScript',
				'entityIdentifierAlias',
				['customEntityComponents', { v1CompatMode: true }],
				'customItemComponents',
				['customBlockComponents', { v1CompatMode: true }],
				'customEntitySyntax',
				'moLang',
				['customCommands', { v1CompatMode: true }],
				['simpleRewrite', { packName: projectName }],
			],
		},
	}
	if (config) {
		const { prefix: projectPrefix, formatVersion: targetVersion } = config

		if (projectPrefix) newConfig['namespace'] = projectPrefix
		if (targetVersion) newConfig['targetVersion'] = targetVersion
	} else {
		newConfig['namespace'] = 'bridge'
		newConfig['targetVersion'] = '1.16.0'
	}
	newConfig['name'] = projectName

	if (bpManifest) {
		if (bpManifest?.header?.description)
			newConfig['description'] = bpManifest.header.description

		if (bpManifest?.metadata?.authors)
			newConfig['authors'] = bpManifest.metadata.authors
	}

	// Get description from lang file
	if (lang && newConfig['description'] === 'pack.description') {
		const lines = lang.split('\n')

		for (const line of lines) {
			if (line.includes('pack.description')) {
				newConfig['description'] = line
					.split('=')
					.pop()
					.replace('\r', '')
			}
		}
	}

	return newConfig
}

export async function createV2Directory(
	targetPath: string,
	projects: string[]
) {
	console.log('[MIGRATION] Start')
	// Iterate each BP in the development_behavior_packs folder
	for (const bpPath of projects) {
		console.log(`[MIGRATION] Migrating project '${bpPath}''`)
		const targetProject = join(targetPath, 'projects', bpPath)

		try {
			// If project already exists in target directory, don't copy it over
			await fs.access(targetProject)
			console.log(`[MIGRATION] Project '${bpPath}' already exists`)
			continue
		} catch {}

		// Get BP manifest
		const bpManifest: MinecraftManifest.IStructure = await readJSON(
			join(BP_BASE_PATH, bpPath, 'manifest.json')
		).catch(() => console.log(`No valid manifest found for BP ${bpPath}`))

		// Get linked RP
		const dependencies = bpManifest?.dependencies
			? bpManifest.dependencies.map(dep => dep.uuid)
			: []
		const rpPath = await findRP(dependencies)

		// Copy BP files over
		console.log('[MIGRATION] Starting BP transfer')
		await transferProject(
			join(BP_BASE_PATH, bpPath),
			join(targetProject, 'BP'),
			join(BP_BASE_PATH, bpPath, 'bridge/cache/BP')
		)
		console.log('[MIGRATION] BP Transfer complete')

		// Copy RP files over if a linked RP exists
		if (rpPath) {
			console.log('[MIGRATION] Starting RP transfer')
			await transferProject(
				join(RP_BASE_PATH, rpPath),
				join(targetProject, 'RP'),
				join(BP_BASE_PATH, bpPath, 'bridge/cache/RP')
			)
			console.log('[MIGRATION] RP Transfer complete')
		}

		// Transfer project config
		const projectConfig = await readJSON(
			join(BP_BASE_PATH, bpPath, 'bridge/config.json')
		).catch(() =>
			console.log(
				`[MIGRATION] No valid bridge config found for BP ${bpPath}`
			)
		)

		let langData: string
		try {
			const langFile = await fs.readFile(
				join(BP_BASE_PATH, bpPath, 'texts/en_US.lang')
			)
			langData = langFile.toString()
		} catch {
			console.log(`[MIGRATION] No valid lang file found for BP ${bpPath}`)
		}

		await writeJSON(
			join(targetProject, 'config.json'),
			updateConfig(
				projectConfig,
				bpManifest,
				bpPath.replace(/BP|behaviors|behavior/gi, ''),
				langData,
				rpPath ? true : false
			),
			true
		)

		// Create other project files
		await fs.writeFile(
			join(targetProject, '.gitignore'),
			`Desktop.ini
.DS_Store
!.bridge/
.bridge/*
!.bridge/compiler/
!.bridge/extensions
builds
		`
		)
		await fs.mkdir(join(targetProject, '.bridge/compiler'), {
			recursive: true,
		})

		// Download v1 -> v2 compatibility extensions
		const CUSTOM_ENTITY_SYNTAX_EXTENSION = 'CustomEntitySyntax/plugin.zip'
		const EXTENSION_PATH = 'https://bridge-core.github.io/plugins/plugins'
		const GLOBAL_EXTENSIONS_PATH = join(targetPath, 'extensions')

		// If the extension already exists, don't install it
		try {
			await fs.access(join(GLOBAL_EXTENSIONS_PATH, 'CustomEntitySyntax'))
		} catch {
			await fetch(join(EXTENSION_PATH, CUSTOM_ENTITY_SYNTAX_EXTENSION))
				.then(data => data.arrayBuffer())
				.then(async data => {
					const EXT_PATH = join(
						GLOBAL_EXTENSIONS_PATH,
						'CustomEntitySyntax'
					)

					await fs.mkdir(
						join(GLOBAL_EXTENSIONS_PATH, 'CustomEntitySyntax'),
						{ recursive: true }
					)
					await fs.writeFile(
						join(
							GLOBAL_EXTENSIONS_PATH,
							CUSTOM_ENTITY_SYNTAX_EXTENSION
						),
						new Buffer(data)
					)

					await createReadStream(
						join(
							GLOBAL_EXTENSIONS_PATH,
							CUSTOM_ENTITY_SYNTAX_EXTENSION
						)
					)
						.pipe(unzipper.Extract({ path: EXT_PATH }))
						.promise()

					await fs.unlink(
						join(
							GLOBAL_EXTENSIONS_PATH,
							CUSTOM_ENTITY_SYNTAX_EXTENSION
						)
					)
					await fs.writeFile(join(EXT_PATH, '.installed'), '')
				})
				.catch(console.error)
		}

		// Move old projects out of com.mojang folder
		const projectBackups = join(targetPath, 'oldProjectBackups')

		// Copy BP files over
		await transferProject(
			join(BP_BASE_PATH, bpPath),
			join(projectBackups, 'BP', bpPath),
			null,
			true
		)
		await fs.rmdir(join(BP_BASE_PATH, bpPath))

		// Copy RP files over if a linked RP exists
		if (rpPath) {
			await transferProject(
				join(RP_BASE_PATH, rpPath),
				join(projectBackups, 'RP', rpPath),
				null,
				true
			)
			await fs.rmdir(join(RP_BASE_PATH, rpPath))
		}
	}
	console.log('[MIGRATION] Complete')
}
