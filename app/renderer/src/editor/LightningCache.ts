/**
 * Responsible for providing fast access to important data like entity identifiers, entity event names,
 * created animation controllers etc.
 *
 * Defined cache hooks at the moment:
 * - bridge:onCacheHook[entity.custom_components]
 */

import FileType from './FileType'
import { readJSON, writeJSON } from '../Utilities/JsonFS'
import { BASE_PATH, CURRENT } from '../constants'
import path from 'path'
import OmegaCache from './OmegaCache'
import JSONTree from './JsonTree'
import fs from 'fs'
import deepmerge from 'deepmerge'
import EventBus from '../EventBus'

function toUnifiedObj(obj: any) {
	let tmp = []
	for (let key in obj) {
		if (obj[key]) tmp.push(obj[key])
	}

	if (tmp.length > 0)
		return deepmerge.all(tmp, {
			arrayMerge: (a: any[], b: any[]) => a.concat(b),
		})
	return {}
}

interface CacheDefConfig {
	as?: string //The file type to save the cache data under

	define_multiple?: boolean //Whether this CacheDef contains a definitions array
	definitions?: CacheDefConfig[] //Define multiple CacheDefs

	load?: string //Load a different CacheDef...
	except?: string //...except the definiton with this key

	key: string //Cache key
	path?: string //Path to data to store
	filter?: string[] //Exclude these values
	loadData?: boolean //Store data from an object instead of the keys

	iterate?: string //An array to iterate over

	hook?: string //Cache hook

	// Search for data
	search?: {
		key: string
		locations: string[]
		data: string
	}
}

export type CacheDef = CacheDefConfig | CacheDefConfig[]

export interface LightningCacheData {
	[fileType: string]: {
		[filePath: string]: {
			[cacheKey: string]: string[]
		}
	}
}

export default class LightningCache {
	static globalCache: LightningCacheData = undefined
	static compiledCache: any = undefined
	static get loadCachePath() {
		return path.join(BASE_PATH, CURRENT.PROJECT, 'bridge/.lightning_cache')
	}
	static init() {
		this.globalCache = undefined
		this.compiledCache = undefined
	}
	static async saveCache() {
		await writeJSON(this.loadCachePath, this.globalCache, true)
	}

	static async add(filePath: string, content: JSONTree, fsAccess = true) {
		if (!(content instanceof JSONTree)) return
		let type = FileType.get(filePath)
		if (type === 'unknown') return

		let defs = await FileType.getLightningCacheDefs(filePath)
		if (defs === undefined) return
		if (this.globalCache === undefined) {
			if (!fsAccess) this.globalCache = {}
			else {
				try {
					this.globalCache = await readJSON(this.loadCachePath)
				} catch (e) {
					this.globalCache = {}
				}
			}
		}

		if (!Array.isArray(defs) && defs.define_multiple !== undefined)
			await Promise.all(
				defs.definitions.map(d =>
					this.parse(filePath, type, d, content).catch(console.error)
				)
			)
		else await this.parse(filePath, type, defs, content)

		this.compiledCache = undefined
		if (fsAccess)
			await writeJSON(this.loadCachePath, this.globalCache, true)
	}

	//Can be used by text files to store data
	static async setPlainData(
		filePath: string,
		data: { [key: string]: string[] }
	) {
		let cacheKey = OmegaCache.toCachePath(filePath, false)
		let fileType = FileType.get(filePath)
		if (this.globalCache === undefined) {
			try {
				this.globalCache = await readJSON(this.loadCachePath)
			} catch (e) {
				this.globalCache = {}
			}
		}
		if (this.globalCache[fileType] === undefined)
			this.globalCache[fileType] = {}

		this.globalCache[fileType][cacheKey] = data
		this.compiledCache = undefined
		await writeJSON(this.loadCachePath, this.globalCache, true)
	}

	//Manually triggers a hook update for a specific identifier
	static async triggerHook(
		filePath: string,
		identifier: string,
		hook: string
	) {
		let cacheKey = OmegaCache.toCachePath(filePath, false)
		let fileType = FileType.get(filePath)
		if (this.globalCache === undefined) {
			try {
				this.globalCache = await readJSON(this.loadCachePath)
			} catch (e) {
				this.globalCache = {}
			}
		}
		if (this.globalCache[fileType] === undefined)
			this.globalCache[fileType] = {}
		if (this.globalCache[fileType][cacheKey] === undefined)
			this.globalCache[fileType][cacheKey] = {}

		this.globalCache[fileType][cacheKey][identifier] =
			EventBus.trigger(`bridge:onCacheHook[${hook}]`).flat() || []
		this.compiledCache = undefined
		await writeJSON(this.loadCachePath, this.globalCache, true)
	}

	static async parse(
		filePath: string,
		type: string,
		defs: CacheDef,
		content: JSONTree
	) {
		if (content === undefined) return

		let except
		//LOAD DIFFERENT DEF OPTIONS
		if (!Array.isArray(defs)) {
			if (defs.load !== undefined) {
				type = defs.as ?? defs.load
				except = defs.except
				defs =
					(await FileType.getLightningCacheDefs(
						undefined,
						defs.load
					)) || []

				if (defs !== undefined && !Array.isArray(defs)) {
					throw new Error(
						"Deeply nesting cache definitions isn't supported yet!"
					)
				}
			} else if (defs.as !== undefined) {
				type = defs.as
				defs = defs.definitions
			}
		}

		let cacheKey = OmegaCache.toCachePath(filePath, false)
		if (this.globalCache[type] === undefined) this.globalCache[type] = {}
		if (this.globalCache[type][cacheKey] === undefined)
			this.globalCache[type][cacheKey] = {}
		let cache = this.globalCache[type][cacheKey]
		;(defs as CacheDefConfig[]).forEach(
			({ iterate, path, key, search, hook, loadData, filter }) => {
				if (iterate !== undefined) {
					;(content.get(iterate)?.children ?? []).forEach(c =>
						this.storeInCahe(cache, c, path, key, filter, loadData)
					)
				} else if (path !== undefined) {
					this.storeInCahe(
						cache,
						content,
						path,
						key,
						filter,
						loadData
					)
				} else if (search !== undefined) {
					let res: string[] = []
					search.locations.forEach(l => {
						let n = content.get(l)
						if (n === undefined) return

						n.forEach(c => {
							if (c.key === search.key) {
								if (search.data !== undefined)
									c = c.get(search.data)

								let data = c.toJSON()
								if (Array.isArray(data)) {
									res.push(...data)
								} else if (typeof data === 'object') {
									res.push(...Object.keys(data))
								} else {
									res.push(data)
								}
							}
						})
					})
					cache[key] = res
				} else if (hook !== undefined) {
					cache[key] =
						EventBus.trigger(
							`bridge:onCacheHook[${hook}]`
						).flat() || []
				} else {
					console.warn('Unknown cache definition!')
				}
			}
		)

		if (except) cache[except] = []
	}

	static storeInCahe(
		cache: { [cacheKey: string]: string[] },
		content: JSONTree,
		path: string,
		key: string,
		filter?: string[],
		loadData?: boolean
	) {
		try {
			let data
			if (path !== 'global') data = content.get(path).toJSON()
			else data = content.toJSON()

			if (Array.isArray(data)) {
				cache[key] = data.filter(d => !filter || !filter.includes(d))
			} else if (typeof data === 'object') {
				cache[key] = loadData
					? <string[]>(
							Object.values(data).filter(
								d => !filter || !filter.includes(<string>d)
							)
					  )
					: Object.keys(data).filter(
							d => !filter || !filter.includes(d)
					  )
			} else {
				cache[key] = [data].filter(d => !filter || !filter.includes(d))
			}
		} catch (e) {
			cache[key] = []
		}
	}

	static async load(filePath?: string): Promise<LightningCacheData> {
		if (this.globalCache !== undefined) return this.globalCache

		try {
			return await readJSON(this.loadCachePath)
		} catch (err) {
			return {}
		}
	}

	static async loadType(
		filePath?: string,
		type?: string
	): Promise<{ [cacheKey: string]: string[] }> {
		if (type === undefined) type = FileType.get(filePath)

		try {
			if (this.globalCache !== undefined)
				return (
					this.globalCache[type][
						OmegaCache.toCachePath(filePath, false)
					] || {}
				)
			return (
				(await readJSON(this.loadCachePath))[type][
					OmegaCache.toCachePath(filePath, false)
				] || {}
			)
		} catch (err) {
			return {}
		}
	}

	static loadSync() {
		if (this.globalCache !== undefined) return this.globalCache
		try {
			return JSON.parse(fs.readFileSync(this.loadCachePath).toString())
		} catch (err) {
			return {}
		}
	}

	static async rename(oldPath: string, newPath: string) {
		let oldType = FileType.get(oldPath)
		let newType = FileType.get(newPath)

		this.globalCache = await this.load()
		try {
			if (this.globalCache[oldType] === undefined) return
			if (this.globalCache[newType] === undefined)
				this.globalCache[newType] = {}
			this.globalCache[newType][
				OmegaCache.toCachePath(newPath, false)
			] = this.globalCache[oldType][
				OmegaCache.toCachePath(oldPath, false)
			]
			delete this.globalCache[oldType][
				OmegaCache.toCachePath(oldPath, false)
			]
		} catch (e) {}

		await writeJSON(this.loadCachePath, this.globalCache, true)
	}
	static async duplicate(what: string, as: string) {
		let oldType = FileType.get(what)
		let newType = FileType.get(as)

		this.globalCache = await this.load()
		try {
			if (this.globalCache[oldType] === undefined) return
			if (this.globalCache[newType] === undefined)
				this.globalCache[newType] = {}
			this.globalCache[newType][
				OmegaCache.toCachePath(as, false)
			] = this.globalCache[oldType][OmegaCache.toCachePath(what, false)]
		} catch (e) {}

		await writeJSON(this.loadCachePath, this.globalCache, true)
	}
	static async clear(filePath: string) {
		let type = FileType.get(filePath)
		if (type === 'unknown') return

		this.globalCache = await this.load()
		try {
			delete this.globalCache[type][
				OmegaCache.toCachePath(filePath, false)
			]
		} catch (e) {}
		await writeJSON(this.loadCachePath, this.globalCache, true)
	}

	static async getCompiled() {
		if (this.compiledCache !== undefined) return this.compiledCache
		let cache = await this.load()
		let res: any = {}

		for (let key in cache) {
			if (cache[key]) res[key] = toUnifiedObj(cache[key])
		}

		this.compiledCache = res
		return res
	}
	static getCompiledSync() {
		if (this.compiledCache !== undefined) return this.compiledCache
		let cache = this.loadSync()
		let res: any = {}

		for (let key in cache) {
			if (cache[key]) res[key] = toUnifiedObj(cache[key])
		}

		this.compiledCache = res
		return res
	}
}
