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
	ProjectConfig.formatVersion_cache = undefined
})

export default class ProjectConfig {
	static get config_path() {
		return path.join(CURRENT.PROJECT_PATH, 'bridge/config.json')
	}
	static prefix_cache: string
	static formatVersion_cache: string

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
	static setPrefix(val: string) {
		;(async () => {
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
		})()
	}
	static getFormatVersionSync() {
		try {
			if (this.formatVersion_cache === undefined)
				this.formatVersion_cache =
					readJSONSync(this.config_path).formatVersion ||
					getFormatVersions().pop()
			return this.formatVersion_cache
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
	static setFormatVersion(val: string) {
		;(async () => {
			let data
			try {
				data = await readJSON(this.config_path)
			} catch (e) {
				data = {}
			}
			this.formatVersion_cache = val

			await writeJSON(this.config_path, {
				...data,
				formatVersion: val,
			})
		})()
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
	static setTheme(val: string) {
		;(async () => {
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
		})()
	}
}
