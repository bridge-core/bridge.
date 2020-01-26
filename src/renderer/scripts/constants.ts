declare var __static: string

import fs from 'fs'
import APP_VERSION from '../../shared/app_version'
import path from 'path'
import { BP_BASE_PATH, RP_BASE_PATH } from '../../shared/Paths'
import Store from '../store/index'
import { FileExplorerStorage } from './Sidebar/FileExplorer'

export const WEB_APP_DATA = 'https://bridge-core.github.io/data/'
export const WEB_APP_PLUGINS = 'https://bridge-core.github.io/plugins/'

export const DOC_URL = 'https://bedrock.dev/1.14.0.0/1.14.0.6/'
export const DOC_LIST = [
	'Entities',
	'Item',
	'Blocks',
	'Biomes',
	'Addons',
	'MoLang',
	'UI',
	'Scripting',
	'Particles',
	'Animations',
	'Entity Events',
	'Recipes',
]

export const MINECRAFT_VERSIONS = JSON.parse(
	fs
		.readFileSync(path.join(__static, 'auto_completions/versions.json'))
		.toString('UTF-8')
)

export { APP_VERSION }
export * from '../../shared/Paths'
export const BASE_PATH = BP_BASE_PATH

export const CURRENT = {
	get PROJECT() {
		return Store.state.Explorer.project.explorer
	},
	get RESOURCE_PACK() {
		return Store.state.Explorer.project.resource_pack
	},

	get PROJECT_PATH() {
		if (!CURRENT.PROJECT)
			throw new Error('CURRENT.PROJECT is not defined yet!')
		return path.join(BASE_PATH, CURRENT.PROJECT)
	},
	get RP_PATH() {
		if (!CURRENT.RESOURCE_PACK)
			throw new Error('CURRENT.RESOURCE_PACK is not defined yet!')
		return path.join(RP_BASE_PATH, CURRENT.RESOURCE_PACK)
	},

	get BPFileExplorer() {
		return FileExplorerStorage.get('explorer', CURRENT.PROJECT)
	},
	get RPFileExplorer() {
		return FileExplorerStorage.get('resource_pack', CURRENT.RESOURCE_PACK)
	},
}
