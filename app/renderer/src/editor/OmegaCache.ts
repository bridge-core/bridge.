/**
 * A thin wrapper around the cached .json files ("./cache" folder)
 */

import { BASE_PATH, RP_BASE_PATH, CURRENT } from '../constants'
import fs, { promises as fsp } from 'fs'
import fse from 'fs-extra'
import path from 'path'
import mkdirp from 'mkdirp'
import FileType from './FileType'
import { readJSON } from '../Utilities/JsonFS'
import JSONTree from './JsonTree'
import { uuid } from '../Utilities/useAttr'

export type FormatVersion = 0 | 1

export interface OmegaCacheData {
	file_version?: number
	file_uuid?: string
	cache_content: any
	format_version?: FormatVersion
	file_path?: string
	file_type?: string
}

export default class OmegaCache {
	static project: string
	static current_base: string
	static init(project: string) {
		this.project = project
		this.current_base = path.join(BASE_PATH, project, 'bridge/cache')
		fs.mkdir(this.current_base, err => {
			// if(err) console.error("[O.CACHE] Did not create new cache folder: ", err.message);
		})
	}

	static mayBeCached(file_path: string) {
		if (this.current_base === undefined) return false

		const rel_bp = path.relative(
			BASE_PATH.slice(0, BASE_PATH.length - 1),
			file_path
		)
		const rel_rp = path.relative(
			RP_BASE_PATH.slice(0, RP_BASE_PATH.length - 1),
			file_path
		)
		return !rel_bp.startsWith('../') || !rel_rp.startsWith('../')
	}
	static toCachePath(file_path: string, with_base = true) {
		if (!file_path)
			throw new Error(
				'[O.CACHE] Called OmegaCache.toCachePath(..) with falsy argument. Expected string'
			)
		if (this.current_base === undefined) {
			console.error(
				'[O.CACHE] Called OmegaCache.toCachePath(..) before calling OmegaCache.init(..)'
			)
			return 'BP/undefined_file'
		}

		const rel_bp = path.relative(
			BASE_PATH.slice(0, BASE_PATH.length - 1),
			file_path
		)
		const rel_rp = path.relative(
			RP_BASE_PATH.slice(0, RP_BASE_PATH.length - 1),
			file_path
		)
		const is_bp = rel_rp.startsWith('../') || rel_rp.startsWith('..\\')
		const tmp_path = is_bp ? rel_bp : rel_rp

		return path
			.join(
				with_base ? this.current_base : '',
				is_bp ? 'BP' : 'RP',
				tmp_path.slice(this.project.length)
			)
			.replace(/\\/g, '/')
	}
	static constructPath(file_path: string) {
		if (!CURRENT.RESOURCE_PACK)
			return file_path.replace('BP', CURRENT.PROJECT_PATH)
		return file_path
			.replace('BP', CURRENT.PROJECT_PATH)
			.replace('RP', CURRENT.RP_PATH)
	}

	static extractFileVersion(
		file_path: string,
		file_str: string,
		comment_char = FileType.getCommentChar(file_path),
		initial = true
	): number {
		try {
			let str = file_str.split('\n').shift()
			let version_templ = `${comment_char}bridge-file-version: #`

			if (
				str.startsWith(version_templ) &&
				!isNaN(Number(str.replace(version_templ, '')))
			) {
				return Number(str.replace(version_templ, ''))
			} else if (initial && file_str.includes('bridge-file-version')) {
				//Fallback to other chars if we fail to load file_version previously (can happen after moving folders)
				return FileType.getCommentChars()
					.map(char =>
						this.extractFileVersion(
							file_path,
							file_str,
							char,
							false
						)
					)
					.find(val => val !== undefined)
			}
		} catch (e) {}
	}

	static isCacheFresh(
		file_path: string,
		cache: OmegaCacheData,
		otherFile: string
	) {
		let file_version = this.extractFileVersion(file_path, otherFile)

		if (file_version !== undefined) {
			if (file_version <= cache.file_version) return true
			else return false
		} else {
			if (cache.file_version !== undefined) return false
			else return true
		}
	}

	static load(file_path: string): Promise<OmegaCacheData> {
		return new Promise((resolve, reject) => {
			fs.readFile(this.toCachePath(file_path), (err, data) => {
				if (err) reject(err)
				else resolve(JSON.parse(data.toString()))
			})
		})
	}
	static async loadFileUUID(file_path: string): Promise<string> {
		try {
			return (await readJSON(this.toCachePath(file_path))).file_uuid
		} catch (e) {
			return 'generic'
		}
	}
	static async loadFileVersion(file_path: string) {
		try {
			return (await readJSON(this.toCachePath(file_path))).file_version
		} catch (e) {
			return 0
		}
	}
	static save(file_path: string, data: OmegaCacheData) {
		return new Promise((resolve, reject) => {
			mkdirp(path.dirname(this.toCachePath(file_path)), err => {
				fs.writeFile(
					this.toCachePath(file_path),
					JSON.stringify(
						{
							file_path,
							file_type: FileType.get(file_path),
							...data,
						},
						null,
						'\t'
					),
					err => {
						if (err)
							return reject(
								'[O.CACHE] Error calling OmegaCache.save(..): ' +
									err.message
							)
						else resolve()
						// console.log("Cached file " + file_path);
					}
				)
			})
		})
	}

	static loadContent(c: any, format_version = 0) {
		if (format_version === 0) return c
		else if (format_version === 1) return JSONTree.buildFromCache(c)
		else throw new Error('Unknown cache format_version: ' + format_version)
	}

	static clear(file_path: string) {
		fs.unlink(this.toCachePath(file_path), err => {})
	}
	static async rename(old_path: string, new_path: string) {
		if (!this.mayBeCached(new_path)) return this.clear(old_path)

		const oldCachePath = this.toCachePath(old_path)
		const newCachePath = this.toCachePath(new_path)

		try {
			await fsp.mkdir(path.dirname(newCachePath), { recursive: true })
		} catch {}
		console.log(oldCachePath, newCachePath)

		try {
			await fsp.copyFile(oldCachePath, newCachePath)
			this.clear(old_path)
		} catch (e) {
			console.error(e)
		}
	}
	static async duplicate(what: string, as: string) {
		if (!this.mayBeCached(as)) return

		const { file_uuid, ...other } = await this.load(what)

		await fsp.writeFile(
			this.toCachePath(as),
			JSON.stringify(
				{
					file_uuid: uuid(),
					...other,
				},
				null,
				'\t'
			)
		)
	}
}
