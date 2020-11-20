declare var __static: string

import APP_VERSION from '../../shared/app_version'
import path from 'path'
import { BP_BASE_PATH, RP_BASE_PATH } from '../../shared/Paths'
import Store from '../store/index'
import { FileExplorerStorage } from './UI/Sidebar/FileExplorer'
import { remote } from 'electron'
import ProjectConfig from './Project/Config'

export const WEB_APP_DATA = 'https://bridge-core.github.io/data/'
export const WEB_APP_PLUGINS = 'https://bridge-core.github.io/plugins/'
export const DEPS_URLS = (version = 'latest') =>
	`https://cdn.jsdelivr.net/npm/bridge-data@${version}/dist/`
export const DOC_URL = 'https://bedrock.dev/r/'
export const DOC_URL_BETA = 'https://bedrock.dev/b/'
export const DOC_LIST = [
	'Entities',
	'Features',
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
].sort()

export { APP_VERSION }
export * from '../../shared/Paths'
export * from '../../shared/DefaultDir'
export const BASE_PATH = BP_BASE_PATH

export const MC_BETA_VERSION = '1.16.200'
export const MC_STABLE_VERSION = '1.16.100'

export const browser_window = remote.getCurrentWindow()

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
	get PROJECT_TARGET_VERSION() {
		return ProjectConfig.getFormatVersionSync()
	},
}
