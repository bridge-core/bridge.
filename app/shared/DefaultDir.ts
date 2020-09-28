/**
 * Allows users to set a different default location for the com.mojang directory
 */
import fs from 'fs'
import path from 'path'

let BRIDGE_DATA_PATH: string
if (process.platform === 'win32')
	BRIDGE_DATA_PATH = path.join(
		process.env.HOMEDRIVE,
		process.env.HOMEPATH,
		'.bridge'
	)
else BRIDGE_DATA_PATH = path.join(process.env.HOME, 'bridge')
export { BRIDGE_DATA_PATH }
export const DATA_PATH = path.join(BRIDGE_DATA_PATH, 'data')

export class DefaultDir {
	static set(dir_path: string) {
		fs.writeFileSync(path.join(DATA_PATH, 'default_dir'), dir_path)
	}
	static get() {
		try {
			return fs
				.readFileSync(path.join(DATA_PATH, 'default_dir'))
				.toString()
		} catch (e) {
			return ''
		}
	}
}
