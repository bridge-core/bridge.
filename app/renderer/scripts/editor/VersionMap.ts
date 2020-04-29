/**
 * Responsible for switching auto-completions ("Target Minecraft Version") between "Stable" and "Beta"
 * This happens by replacing the entry point of auto-completions (e.g. "entity/main") by a different entry point
 * defined inside the "auto_completions/version_map.json" file (e.g. "entity/main_beta")
 */
declare var __static: string

import fs from 'fs'
import path from 'path'
const MAP = JSON.parse(
	fs
		.readFileSync(path.join(__static, 'auto_completions/version_map.json'))
		.toString()
)

export default class VersionMap {
	/**
	 * @param {String} state_id
	 * @param {String} version
	 */
	static convert(state_id: string, version: string) {
		if (MAP[state_id] === undefined || MAP[state_id][version] === undefined)
			return state_id
		return MAP[state_id][version]
	}
}
