/**
 * Save data per project inside a "bridge/config.json" file
 */
import { CURRENT } from '../constants'
import path from 'path'
import { readJSON, writeJSON, readJSONSync } from '../Utilities/JsonFS'
import SETTINGS from '../../store/Settings'
import { on } from '../AppCycle/EventSystem'
import { getFormatVersions } from '../autoCompletions/components/VersionedTemplate/Common'

on('bridge:changedProject', () => {
	ProjectConfig.prefix_cache = undefined
	ProjectConfig.formatVersionCache = undefined
})

export default class ProjectConfig {
	static get config_path() {
		return path.join(CURRENT.PROJECT_PATH, 'bridge/config.json')
	}
	static prefix_cache: string
	static formatVersionCache: string

	//PREFIX
	static getPrefixSync() {
		try {
			if (this.prefix_cache === undefined)
				this.prefix_cache =
					readJSONSync(this.config_path).prefix || 'bridge'
			return this.prefix_cache
		} catch (e) {
			return 'bridge'
		}
	}
	static get prefix(): Promise<string> {
		return (async () => {
			try {
				return (await readJSON(this.config_path)).prefix || 'bridge'
			} catch {
				return 'bridge'
			}
		})()
	}
	static async setPrefix(val: string) {
		let data
		try {
			data = await readJSON(this.config_path)
		} catch (e) {
			data = {}
		}
		this.prefix_cache = val

		await writeJSON(this.config_path, {
			...data,
			prefix: val,
		})
	}
	static getFormatVersionSync() {
		try {
			if (this.formatVersionCache === undefined)
				this.formatVersionCache =
					readJSONSync(this.config_path).formatVersion ||
					getFormatVersions().pop()
			return this.formatVersionCache
		} catch (e) {
			return getFormatVersions().pop()
		}
	}
	static get formatVersion(): Promise<string> {
		return (async () => {
			try {
				return (
					(await readJSON(this.config_path)).formatVersion ||
					getFormatVersions().pop()
				)
			} catch {
				return getFormatVersions().pop()
			}
		})()
	}
	static async setFormatVersion(val: string) {
		let data
		try {
			data = await readJSON(this.config_path)
		} catch (e) {
			data = {}
		}
		this.formatVersionCache = val

		await writeJSON(this.config_path, {
			...data,
			formatVersion: val,
		})
	}
	static get theme(): Promise<string> {
		return (async () => {
			try {
				return (
					(await readJSON(this.config_path)).theme[
						SETTINGS.load().id
					] || 'bridge.null'
				)
			} catch {
				return 'bridge.null'
			}
		})()
	}
	static async setTheme(val: string) {
		let data
		try {
			data = await readJSON(this.config_path)
		} catch (e) {
			data = {}
		}

		await writeJSON(this.config_path, {
			...data,
			theme: {
				...(data.theme || {}),
				[SETTINGS.load().id]: val,
			},
		})
	}
}
