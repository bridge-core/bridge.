import { promises as fs, Dirent } from 'fs'
import path from 'path'
import { readJSON, writeJSON } from './Utilities/JsonFS'
import ProjectConfig from './Project/Config'
import { CURRENT } from './constants'
import { detachMerge } from './Utilities/mergeUtils'
import { trySetRP } from './Utilities/FindRP'
import { createInformationWindow } from './UI/Windows/Common/CommonDefinitions'
import { BridgeCore } from './bridgeCore/main'
import cJSON from 'comment-json'
import LightningCache from './editor/LightningCache'
import JSONTree from './editor/JsonTree'
import OmegaCache from './editor/OmegaCache'
import { uuid } from './Utilities/useAttr'
declare var __static: string

let LOAD_LOCATIONS: string[] = []

export function addLoadLocation(str: string) {
	LOAD_LOCATIONS.push(str)
}
export function resetLoadLocations() {
	LOAD_LOCATIONS = []
}

export interface IManifest {
	display_name?: string
	description?: string
	icon?: string
	rp_map?: {
		[file_path: string]: string
	}
	bp_map?: {
		[file_path: string]: string
	}
	expand_rp_files?: {
		[file_path: string]: string
	}
	expand_bp_files?: {
		[file_path: string]: string
	}
	copy_rp_files?: {
		[file_path: string]: string
	}
}

export interface IPresetData {
	folder_path: string
	manifest: IManifest
}

export interface IPresetEnv {
	IDENTIFIER: string
	IDENTIFIER_NAME: string //Identifier, first letter capitalized & "_" replaced with spaces
	PROJ_PREFIX: string
	[x: string]: string
}

export async function loadPresets() {
	let manifests: IPresetData[] = []
	await Promise.all(
		[path.join(__static, 'presets')]
			.concat(LOAD_LOCATIONS)
			.map(async load_path => {
				let dirents: (
					| Dirent
					| { name: string; isFile: () => false }
				)[] = []
				try {
					dirents = await fs.readdir(load_path, {
						withFileTypes: true,
					})
				} catch {}

				await Promise.all(
					dirents.map(async dirent => {
						//Apparently electron doesn't support withFileTypes inside of .asar archives yet, just returns string
						if (typeof dirent === 'string')
							dirent = { name: dirent, isFile: () => false }
						if (dirent.isFile()) return //Only folders are valid presets

						try {
							manifests.push({
								folder_path: path.join(load_path, dirent.name),
								manifest: await readJSON(
									path.join(
										load_path,
										dirent.name,
										'manifest.json'
									)
								),
							})
						} catch {}
					})
				)
			})
	)
	return manifests
}

export async function buildPreset(preset: IPresetData, identifier: string) {
	if (!(await trySetRP()))
		return createInformationWindow(
			'No Resource Pack',
			'Please create or connect a resource pack before creating a preset.'
		)

	const {
		folder_path,
		manifest: {
			bp_map = {},
			rp_map = {},
			expand_bp_files = {},
			expand_rp_files = {},
			copy_rp_files = {},
		} = {},
	} = preset
	const ENV: IPresetEnv = {
		IDENTIFIER: identifier,
		IDENTIFIER_NAME:
			identifier[0].toUpperCase() +
			identifier.slice(1).replace(/\_/g, ' '),
		PROJ_PREFIX: await ProjectConfig.prefix,
	}
	let promises = []

	promises.push(
		...Object.entries(bp_map).map(([preset_path, create_path]) =>
			buildPresetFile(
				path.join(folder_path, preset_path),
				path.join(CURRENT.PROJECT_PATH, create_path),
				ENV
			)
		)
	)
	promises.push(
		...Object.entries(rp_map).map(([preset_path, create_path]) =>
			buildPresetFile(
				path.join(folder_path, preset_path),
				path.join(CURRENT.RP_PATH, create_path),
				ENV
			)
		)
	)

	promises.push(
		...Object.entries(expand_bp_files).map(([preset_path, expand_path]) =>
			expandPresetFile(
				path.join(folder_path, preset_path),
				path.join(CURRENT.PROJECT_PATH, expand_path),
				ENV
			)
		)
	)
	promises.push(
		...Object.entries(expand_rp_files).map(([preset_path, expand_path]) =>
			expandPresetFile(
				path.join(folder_path, preset_path),
				path.join(CURRENT.RP_PATH, expand_path),
				ENV
			)
		)
	)

	promises.push(
		...Object.entries(copy_rp_files).map(
			async ([preset_path, copy_path]) => {
				let file_path = transformPath(
					path.join(CURRENT.RP_PATH, copy_path),
					path.extname(preset_path),
					ENV
				)

				await fs.mkdir(path.dirname(file_path), { recursive: true })
				await fs.copyFile(
					path.join(folder_path, preset_path),
					file_path
				)
			}
		)
	)

	await Promise.all(promises).catch(console.error)

	try {
		await CURRENT.BPFileExplorer.refresh()
		await CURRENT.RPFileExplorer.refresh()
	} catch {}
}

export function transformPath(file_path: string, ext: string, ENV: IPresetEnv) {
	file_path = file_path.replace(
		/{{[^{}]+}}/g,
		(match: string) => ENV[match.replace(/{{|}}/g, '')] || 'undefined'
	)

	if (path.extname(file_path) === '')
		return path.join(file_path, `${ENV.IDENTIFIER}${ext}`)

	return file_path
}

export async function buildPresetFile(
	from_path: string,
	to_path: string,
	ENV: IPresetEnv
) {
	to_path = transformPath(to_path, path.extname(from_path), ENV)

	let templ = (await fs.readFile(from_path)).toString('UTF-8')
	templ = templ.replace(
		/{{[^{}]+}}/g,
		(match: string) => ENV[match.replace(/{{|}}/g, '')] || 'undefined'
	)

	await fs.mkdir(path.dirname(to_path), { recursive: true })
	if (path.extname(to_path) === '.json') {
		templ = cJSON.parse(templ, undefined, true)
		const fileUuid = uuid()

		await OmegaCache.save(to_path, {
			format_version: 0,
			cache_content: templ,
			file_uuid: fileUuid,
		})
		await writeJSON(
			to_path,
			await BridgeCore.beforeSave(templ, to_path),
			true
		)
		await LightningCache.add(
			to_path,
			new JSONTree('global').buildFromObject(templ)
		)
	} else {
		await fs.writeFile(to_path, templ)
	}
}

export async function expandPresetFile(
	from_path: string,
	to_path: string,
	ENV: IPresetEnv
) {
	let original: any = {}
	try {
		original = await readJSON(to_path)
	} catch {
		try {
			original = (await fs.readFile(to_path)).toString('utf-8')
		} catch {
			original = ''
		}
	}

	let templ = (await fs.readFile(from_path)).toString('UTF-8')
	templ = templ.replace(
		/{{[^{}]+}}/g,
		(match: string) => ENV[match.replace(/{{|}}/g, '')] || 'undefined'
	)

	await fs.mkdir(path.dirname(to_path), { recursive: true })

	if (typeof original === 'string')
		await fs.writeFile(to_path, `${original}\n${templ}`)
	else
		await writeJSON(
			to_path,
			detachMerge({}, original, JSON.parse(templ)),
			true
		)
}
