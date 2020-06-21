/**
 * Provide and process all auto-completion related logic
 */
import fs from 'fs'
import deepmerge from 'deepmerge'
import Store from '../../store/index'
import { DYNAMIC, SET_CONTEXT, CONTEXT_UP, CONTEXT_DOWN } from './Dynamic'
import { detachMerge as detachObj } from '../Utilities/mergeUtils'
import ComponentProvider from './Components'
import FileType from '../editor/FileType'
import { Omega } from './Omega'
import { BridgeCore } from '../bridgeCore/main'
import EventBus from '../EventBus'
import { FileDefinition } from '../editor/FileDefinition'
import JSONTree from '../editor/JsonTree'
import InformationWindow from '../UI/Windows/Common/Information'
import { compileVersionedTemplate } from './components/VersionedTemplate'

declare var __static: string

let FILE_DEFS: FileDefinition[] = []
let PLUGIN_FILE_DEFS: FileDefinition[] = []
let PLUGIN_COMPLETIONS: { key: string; created: boolean }[][] = []
let PLUGINS_TO_LOAD: any[] = []
export let LIB_LOADED = false
const REMOVE_LIST = [
	'$load',
	'$dynamic_template',
	'$versioned_template',
	'$placeholder',
]
export let LIB: any = { dynamic: DYNAMIC }

class Provider {
	private start_state: string
	private META: any
	constructor(current?: string) {
		this.validator(current)
	}

	static loadAssets() {
		let total = 0
		LIB = { dynamic: DYNAMIC }

		this.loadAsset('files').then((files: string[]) =>
			files.forEach(f =>
				this.loadAsset(f).then((data: any) => {
					//ALLOW MULTIPLE FILES TO REGISTER THE SAME LIB KEY
					if (data.$register_as !== undefined) {
						f = data.$register_as
						delete data.$register_as
					}

					this.storeInLIB(f, data)
					total++
					if (total >= files.length) {
						LIB_LOADED = true
						this.loadAllPluginCompletions()
						EventBus.trigger('bridge:loadedFileDefs')
					}
				})
			)
		)
		this.loadAsset('file_definitions', 'data/').then(
			(def: FileDefinition[]) => {
				FILE_DEFS = def
			}
		)
	}
	static loadAsset(name: string, path = 'auto_completions/'): any {
		return new Promise((resolve, reject) => {
			fs.readFile(__static + `/${path}${name}.json`, (err, data) => {
				if (err) reject(err)
				try {
					resolve(JSON.parse(data.toString()))
				} catch (err) {
					throw new Error(
						`File ${name} contains invalid JSON: ${err.message}`
					)
				}
			})
		})
	}
	static storeInLIB(
		path: string | string[],
		store: any,
		current = LIB,
		native = true
	) {
		let arr_path: string[]
		if (typeof path === 'string') arr_path = path.split('/')
		else arr_path = path

		let key = arr_path.shift()
		let created = false
		if (current[key] === undefined) {
			current[key] = {}
			created = true
		}
		if (!native)
			PLUGIN_COMPLETIONS[PLUGIN_COMPLETIONS.length - 1].push({
				key,
				created,
			})

		if (arr_path.length > 0) {
			this.storeInLIB(arr_path, store, current[key], native)
		} else if (native || created) {
			current[key] = deepmerge(current[key], store)
		} else if (!native && arr_path.length > 0) {
			return new InformationWindow(
				'Auto-Completions',
				'Unable to register auto-completions to already exisiting path.'
			)
		}
	}
	static removeFromLib(
		path: { key: string; created: boolean }[],
		current = LIB
	) {
		let { key, created } = path.shift()
		// console.log(key, created);
		if (path.length > 0) this.removeFromLib(path, current[key])
		if (created) delete current[key]
	}
	static addPluginCompletion(path: string, def: any) {
		if (!LIB_LOADED) PLUGINS_TO_LOAD.push({ path, def })
		else {
			PLUGIN_COMPLETIONS.push([])
			this.storeInLIB(path, def, undefined, false)
		}
	}
	static loadAllPluginCompletions() {
		PLUGINS_TO_LOAD.forEach(({ path, def }) => {
			PLUGIN_COMPLETIONS.push([])
			this.storeInLIB(path, def, undefined, false)
		})
		PLUGINS_TO_LOAD = []
	}
	static removePluginCompletions() {
		PLUGIN_COMPLETIONS.forEach(comp => this.removeFromLib(comp))
		PLUGIN_COMPLETIONS = []
	}
	static addPluginFileDef(def: FileDefinition) {
		PLUGIN_FILE_DEFS.push(def)
	}
	static removePluginFileDefs() {
		PLUGIN_FILE_DEFS = []
	}
	static get FILE_DEFS() {
		return FILE_DEFS.concat(PLUGIN_FILE_DEFS).concat(
			BridgeCore.FILE_DEFS as FileDefinition[]
		)
	}
	get FILE_DEFS() {
		return FILE_DEFS.concat(PLUGIN_FILE_DEFS).concat(
			BridgeCore.FILE_DEFS as FileDefinition[]
		)
	}

	validator(path?: string) {
		if (path === undefined) return (this.start_state = 'unknown')
		path = path.replace(/\\/g, '/')

		for (let def of this.FILE_DEFS) {
			if (
				FileType.pathIncludes(path, def.includes) &&
				(path.includes('development_behavior_packs') ||
					path.includes('behavior_packs') ||
					path.includes('/BP/') ||
					def.rp_definition ||
					FileType.fallbackToBP(path))
			)
				return (this.start_state = def.start_state)
		}
		return (this.start_state = 'unknown')
	}
	setStartState(startState: string) {
		this.start_state = startState
	}

	get(path: string, file_path?: string, context?: JSONTree) {
		//Set validator if file_path !== undefined
		if (file_path !== undefined) this.validator(file_path)
		if (this.start_state === 'unknown')
			return { object: [], value: [], META: {} }

		path = path.replace('global', this.start_state)

		SET_CONTEXT(context, context === undefined ? undefined : context.parent)
		let propose = this.walk(path.split('/'))
		// console.log('[PROPOSING]', path, propose, LIB)

		return this.preparePropose(
			propose,
			context === undefined ? [] : Object.keys(context.toJSON(false))
		)
	}

	getMeta(path: string, file_path?: string, context?: JSONTree) {
		return this.get(path, file_path, context).META
	}

	preparePropose(
		propose: { object: any; value: string[] },
		context: string[],
		finalPrep = true
	): { value: string[]; object: string[]; META: any } {
		if (propose.object === LIB) return { value: [], object: [], META: {} }
		let { object, value } = propose
		if (finalPrep) this.META = {}

		if (object.$load !== undefined) {
			let {
				object: object_internal,
				value: value_internal,
				META,
			} = this.preparePropose(
				this.omegaExpression(object.$load),
				context,
				false
			)

			object = detachObj(object, object_internal)
			value = value.concat(value_internal)
			this.META = detachObj(this.META, META)
		}
		if (object.$dynamic_template !== undefined) {
			let t = this.compileTemplate(object.$dynamic_template)
			if (t !== undefined) object = detachObj(object, t)
		}
		if (object.$versioned_template !== undefined) {
			const {
				object: tmpObject,
				value: tmpValue,
			} = compileVersionedTemplate(object.$versioned_template)
			if (tmpObject !== undefined) object = detachObj(object, tmpObject)
			if (tmpValue !== undefined && tmpValue.length > 0)
				value = value.concat(tmpValue)
		}

		return {
			object: finalPrep
				? this.parseObjectCompletions(object, value, context)
				: object,
			value: value.filter(
				e => typeof e === 'string' && e !== '' && e !== '@wildcard'
			),
			META: this.META,
		}
	}

	parseObjectCompletions(
		object: any,
		value: string[],
		context: string[] = [],
		asObject = false
	): string[] {
		return Object.keys(object)
			.map(key => {
				if (key.startsWith('$dynamic_template.')) {
					if (
						object[key].$if === undefined ||
						Omega.walk(object[key].$if)
					)
						return key.substring(key.indexOf('.') + 1, key.length)
				} else if (key.startsWith('$versioned_template.')) {
					return key.substring(key.indexOf('.') + 1, key.length)
				} else if (key.startsWith('@import.value')) {
					if (Array.isArray(object[key])) {
						if (asObject) return object[key]
						value.push(...object[key])
						return
					}

					let {
						object: object_internal,
						value: value_internal,
					} = this.omegaExpression(object[key])

					if (asObject)
						return value_internal.concat(
							this.parseObjectCompletions(
								object_internal,
								value,
								undefined,
								true
							)
						)
					value.push(...value_internal)
					value.push(
						...this.parseObjectCompletions(object_internal, value)
					)
					return
				} else if (key.startsWith('@value.')) {
					if (asObject) return key.split('.').pop()
					value.push(key.split('.').pop())
					return
				} else if (key === '$asObject') {
					return Omega.walk(object.$asObject)
				} else if (REMOVE_LIST.includes(key)) {
					return
				} else if (key[0] === '$') {
					let {
						object: object_internal,
						value: value_internal,
					} = this.omegaExpression(key)

					return this.parseObjectCompletions(
						object_internal,
						value,
						context,
						true
					).concat(...value_internal)
				} else if (key === '@meta') {
					this.META = detachObj(this.META, object['@meta'])
					return
				} else if (key === '@wildcard') {
					return
				}
				return key
			})
			.reduce((propose, element) => {
				if (!Array.isArray(element)) element = [element]

				if (element[0] !== undefined)
					return propose.concat(
						element.filter(
							(e: string) =>
								!context.includes(e) && e !== '@wildcard'
						)
					)
				return propose
			}, [])
	}

	walk(path_arr: string[], current = LIB): { object: any; value: string[] } {
		if (typeof current === 'function') {
			if (path_arr.length === 0) return { object: {}, value: current() }
			current = current()
		} else if (typeof current === 'string') {
			for (let i = 0; i < path_arr.length + 1; i++) CONTEXT_UP()
			let { object, value } = this.omegaExpression(current)
			for (let i = 0; i < path_arr.length + 1; i++) CONTEXT_DOWN()

			if (path_arr.length === 0) return { object, value }

			current = object
		} else if (
			path_arr === undefined ||
			path_arr.length === 0 ||
			current === undefined
		) {
			if (Array.isArray(current)) return { object: {}, value: current }
			return { object: current, value: [] }
		}

		let key = path_arr.shift()
		if (current[key] === undefined) {
			let res = ComponentProvider.process(this, key, path_arr, current)

			if (res !== undefined) {
				return res
			} else if (current !== LIB) {
				for (let k of Object.keys(current)) {
					if (k[0] === '$' && !REMOVE_LIST.includes(k)) {
						for (let i = 0; i < path_arr.length + 1; i++)
							CONTEXT_UP()
						let { object, value } = this.omegaExpression(k)
						for (let i = 0; i < path_arr.length + 1; i++)
							CONTEXT_DOWN()
						object = this.parseObjectCompletions(object, value)

						if (
							value.includes(key) ||
							object.includes(key) ||
							value.includes('@wildcard')
						)
							return this.walk(path_arr, current[k])
					}
				}
			}
		}
		return this.walk(path_arr, current[key])
	}

	omegaExpression(expression: string) {
		// console.log(expression, Omega.eval(expression))
		return Omega.eval(expression)
	}

	compileTemplate(template: any): any {
		if (template.$if !== undefined && !Omega.walk(template.$if)) return {}

		let dyn = Omega.walk(template['$key'])
		if (template[`$dynamic_template.${dyn}`] !== undefined) {
			return this.compileTemplate(template[`$dynamic_template.${dyn}`])
		}
		return template[dyn || '$fallback'] || template['$default']
	}
}
Provider.loadAssets()

export default Provider
