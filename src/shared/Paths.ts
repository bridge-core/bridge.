/**
 * Change default com.mojang directory depending on the user's platform and preferences
 */
import os from 'os'
import { DefaultDir } from './DefaultDir'
import path from 'path'
let default_dir = DefaultDir.get()

export const LOCAL_STATE_PATH = (() => {
	if (default_dir !== '') return default_dir

	// Taken from minecraft-addon-tools/minecraft-addon-toolchain by @AtomicBlom
	let platformRoot = null
	switch (os.platform()) {
		case 'win32':
			platformRoot = path.join(
				process.env['LOCALAPPDATA'],
				'Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState'
			)
			break
		case 'linux':
			platformRoot = path.join(os.homedir(), '.local/share/mcpelauncher')
			break
		case 'darwin':
			platformRoot = path.join(
				os.homedir(),
				'Library/Application Support/mcpelauncher'
			)
			break
		case 'android':
			platformRoot = path.join(os.homedir(), 'storage/shared/')
			break
		default:
			return
	}
	return platformRoot
})()

export const MOJANG_PATH = path.join(LOCAL_STATE_PATH, 'games/com.mojang')
export const BP_BASE_PATH = path.join(
	MOJANG_PATH,
	'development_behavior_packs/'
)
export const RP_BASE_PATH = path.join(
	MOJANG_PATH,
	'development_resource_packs/'
)
export const DEBUG_PATH = path.join(LOCAL_STATE_PATH, 'logs')
