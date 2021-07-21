import { promises as fs, createReadStream } from 'fs'
import { join } from 'path'
import { BP_BASE_PATH, RP_BASE_PATH } from '../../../../../shared/Paths'
import { readJSON, writeJSON } from '../../../Utilities/JsonFS'
import unzipper from 'unzipper'

async function iterateDir(src: string, dest: string, cache: string) {
	await fs.mkdir(dest, { recursive: true })

	const dirents = await fs.readdir(src, { withFileTypes: true })

	for (const dirent of dirents) {
		if (dirent.isDirectory()) {
			// Don't copy bridge folder
			if (dirent.name != 'bridge') {
				iterateDir(
					join(src, dirent.name),
					join(dest, dirent.name),
					join(cache, dirent.name)
				)
			}
			continue
		}

		try {
			// Try reading from cache
			const { cache_content: cacheContent } = await readJSON(
				join(cache, dirent.name)
			)

			// Non JSON files: Functions, scripts etc.
			if (!dirent.name.endsWith('.json'))
				await fs.writeFile(join(dest, dirent.name), cacheContent)

			// JSON files
			await writeJSON(
				join(dest, dirent.name),
				transform(cacheContent.children),
				true
			)
		} catch {
			// No cache, just copy file
			await fs.copyFile(join(src, dirent.name), join(dest, dirent.name))
		}
	}
}

function transform(children: any[]) {
	let res: any = {}
	let resArr: any[] = []

	if (!children) return {}

	for (const c of children) {
		if (c.is_disabled) continue

		if (c.is_minified && !c.key) resArr.push(c.children)
		else if (c.is_minified && c.key)
			res[c.key] = c.data || c.children || c.array
		else if (Array.isArray(c.children)) res[c.key] = transform(c.children)
		else if (c.key && c.data) {
			if (c.key == 'format_version') res[c.key] = c.data
			else res[c.key] = convertValues(c.data)
		} else if (c.array) res[c.key] = transform(c.array)
	}

	return resArr.length > 0 ? resArr : res
}

function convertValues(value: string) {
	if (value == 'false') return false
	else if (value == 'true') return true
	else {
		const newValue = parseInt(value)
		if (isNaN(newValue)) return value
		else return newValue
	}
}

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
		capabilities: [],
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
			newConfig['author'] = bpManifest.metadata.authors
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
	for (const bpPath of projects) {
		const targetProject = join(targetPath, 'projects', bpPath)

		try {
			// If project already exists in target directory, don't copy it over
			await fs.access(targetProject)
			continue
		} catch {}

		// Find linked RP
		let rpPath = undefined
		let bpManifest = undefined
		let rpManifest = undefined
		let projectConfig = undefined
		let lang = undefined

		// Get linked RP
		try {
			bpManifest = await readJSON(
				join(BP_BASE_PATH, bpPath, 'manifest.json')
			)

			const resourcePacks = await fs.readdir(RP_BASE_PATH)
			for (const rp of resourcePacks) {
				try {
					rpManifest = await readJSON(
						join(RP_BASE_PATH, rp, 'manifest.json')
					)
				} catch {}

				if (bpManifest.dependencies && rpManifest) {
					for (const dependency of bpManifest.dependencies) {
						if (dependency.uuid == rpManifest.header.uuid) {
							rpPath = rp
						}
					}
				}
			}
		} catch {
			console.log(
				`No resource pack found linked with pack uuid ${bpManifest.uuid}`
			)
		} // No dependencies

		// Copy BP files over
		await iterateDir(
			join(BP_BASE_PATH, bpPath),
			join(targetProject, 'BP'),
			join(BP_BASE_PATH, bpPath, 'bridge/cache/BP')
		)

		// Copy RP files over if a linked RP exists
		if (rpPath) {
			await iterateDir(
				join(RP_BASE_PATH, rpPath),
				join(targetProject, 'RP'),
				join(BP_BASE_PATH, bpPath, 'bridge/cache/RP')
			)
		}

		// Transfer project config
		try {
			projectConfig = await readJSON(
				join(BP_BASE_PATH, bpPath, 'bridge/config.json')
			)
		} catch {}
		try {
			const langFile = await fs.readFile(
				join(BP_BASE_PATH, bpPath, 'texts/en_US.lang')
			)
			lang = langFile.toString()
		} catch {}

		await writeJSON(
			join(targetProject, 'config.json'),
			updateConfig(
				projectConfig,
				bpManifest,
				bpPath.replace(/BP|behaviors/gi, ''),
				lang,
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
!.bridge/config.json
builds
		`
		)

		await fs.mkdir(join(targetProject, '.bridge/compiler'), {
			recursive: true,
		})
		await writeJSON(
			join(targetProject, '.bridge/compiler/default.json'),
			{
				icon: 'mdi-cogs',
				name: '[Default Script]',
				description:
					'[Transforms the "bridge." folder structure to "com.mojang". "bridge." runs it automatically in dev mode in the background to enable fast, incremental builds for testing. Includes bridge. v1 backwards compatibility.]',
				plugins: [
					'typeScript',
					'entityIdentifierAlias',
					['customEntityComponents', { v1CompatMode: true }],
					'customItemComponents',
					['customBlockComponents', { v1CompatMode: true }],
					'customEntitySyntax',
					'moLang',
					['customCommands', { v1CompatMode: true }],
					['simpleRewrite', { packName: `${bpPath} v2` }],
				],
			},
			true
		)
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
	}
}
