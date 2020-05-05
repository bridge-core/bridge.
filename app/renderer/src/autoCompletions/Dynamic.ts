/**
 * Defines dynamic references available to the auto-completion engine
 */
import { BASE_PATH, RP_BASE_PATH, CURRENT } from '../constants'
import TabSystem from '../TabSystem'
import Store from '../../store/index'
import path from 'path'
import fs from 'fs'
import LightningCache from '../editor/LightningCache'
import { BridgeCore } from '../bridgeCore/main'
import { readJSONSync } from '../Utilities/JsonFS'
import ProjectConfig from '../Project/Config'
import ComponentRegistry from '../plugins/CustomComponents'
import JSONTree from '../editor/JsonTree'
import { proposeCustomCommands } from '../plugins/CustomCommands'

let PARENT_CONTEXT: JSONTree
let NODE_CONTEXT: JSONTree
let PREV_CONTEXT: JSONTree[] = []

export function walkSync(
	dir: string,
	relative = false,
	relative_path = '',
	filelist: string[] = []
) {
	fs.readdirSync(dir).forEach(file => {
		filelist = fs.statSync(path.join(dir, file)).isDirectory()
			? walkSync(
					path.join(dir, file),
					relative,
					path.join(relative_path, file),
					filelist
			  )
			: (filelist ?? []).concat(
					path.join(relative ? relative_path : dir, file)
			  )
	})
	return filelist
}

export function SET_CONTEXT(node?: JSONTree, parent?: JSONTree) {
	PARENT_CONTEXT = parent
	NODE_CONTEXT = node
}
export function CONTEXT_UP() {
	PREV_CONTEXT.push(NODE_CONTEXT)
	if (NODE_CONTEXT !== undefined) NODE_CONTEXT = NODE_CONTEXT.parent
	if (PARENT_CONTEXT !== undefined) PARENT_CONTEXT = PARENT_CONTEXT.parent
}
export function CONTEXT_DOWN() {
	if (PREV_CONTEXT.length > 0) {
		PARENT_CONTEXT = NODE_CONTEXT
		NODE_CONTEXT = PREV_CONTEXT.pop()
	} else if (NODE_CONTEXT !== undefined) {
		throw new Error('Called CONTEXT_DOWN without PREV_CONTEXT.')
	}
}

export const DYNAMIC = {
	get cache() {
		return LightningCache.getCompiledSync()
	},
	bridge_core: {
		is_active() {
			return BridgeCore.isActive()
		},
		is_not_active() {
			return !BridgeCore.isActive()
		},
	},
	plugins: {
		custom_components() {
			return ComponentRegistry.propose()
		},
		custom_commands() {
			return proposeCustomCommands()
		},
	},
	list: {
		next_index() {
			if (NODE_CONTEXT.is_array) {
				let res = []
				let arr = NODE_CONTEXT.toJSON()

				for (let i = arr.length; i >= 0; i--) {
					res.push(i + '')
				}
				return res
			}
			return ['0']
		},
		index_pair() {
			return ['0', '1']
		},
		index_triple() {
			return ['0', '1', '2']
		},
	},
	setting: {
		target_version() {
			return Store.state.Settings.target_version
		},
		project_prefix() {
			return ProjectConfig.getPrefixSync() + ':'
		},
	},
	entity: {
		cached_families() {
			return LightningCache.getCompiledSync()?.entity?.families || []
		},
		component_groups() {
			try {
				return Object.keys(
					TabSystem.getSelected()
						.content.get('#;bridge_node_skip;#/component_groups')
						.toJSON()
				)
			} catch (e) {
				return []
			}
		},
		events() {
			try {
				return Object.keys(
					TabSystem.getSelected()
						.content.get('#;bridge_node_skip;#/events')
						.toJSON()
				)
			} catch (e) {
				return []
			}
		},
		all_events() {
			return LightningCache.getCompiledSync()?.entity?.events || []
		},
		animation_references() {
			try {
				return Object.keys(
					TabSystem.getSelected()
						.content.get(
							'#;bridge_node_skip;#/description/animations'
						)
						.toJSON()
				)
			} catch (e) {
				return []
			}
		},
	},
	recipe: {
		pattern_keys() {
			try {
				let data = TabSystem.getSelected()
					.content.get('minecraft:recipe_shaped/pattern')
					.toJSON()
				let res: string[] = []
				data.forEach((e: string) => (res = res.concat(e.split(''))))
				return res.filter(e => e !== ' ')
			} catch (e) {
				return []
			}
		},
	},
	biome: {
		name_references() {
			return walkSync(CURRENT.PROJECT_PATH + '\\biomes').map(e => {
				return e
					.split(/\\|\//g)
					.pop()
					.replace('.json', '')
			})
		},
		feature_references() {
			return LightningCache.getCompiledSync()?.feature?.identifiers || []
		},
	},
	animation_controller: {
		current_states() {
			try {
				let current = NODE_CONTEXT ?? TabSystem.getCurrentNavObj()
				if (current === undefined) return []

				if (current.parent?.get('states') ?? current.get('states'))
					return Object.keys(
						(
							current.parent?.get('states') ??
							current.get('states')
						).toJSON()
					)

				while (current !== undefined && current.key !== 'states') {
					current = current.parent
				}
				if (current && current.key === 'states')
					return Object.keys(current.toJSON())
				return []
			} catch (e) {
				return []
			}
		},
	},
	client_entity: {
		animation_references() {
			try {
				return Object.keys(
					TabSystem.getSelected()
						.content.get(
							'minecraft:client_entity/description/animations'
						)
						.toJSON()
				)
			} catch (e) {
				return []
			}
		},
	},
	rp: {
		item_textures() {
			try {
				return Object.keys(
					readJSONSync(
						path.join(CURRENT.RP_PATH, 'textures/item_texture.json')
					).texture_data
				)
			} catch (e) {
				return []
			}
		},
		terrain_texture() {
			try {
				return Object.keys(
					readJSONSync(
						path.join(
							CURRENT.RP_PATH,
							'textures/terrain_texture.json'
						)
					).texture_data
				)
			} catch (e) {
				return []
			}
		},
		entity_textures() {
			try {
				return walkSync(
					path.join(CURRENT.RP_PATH, 'textures/entity')
				).map(e => {
					let tmp = e
						.replace(
							RP_BASE_PATH.replace(/\//g, '\\') +
								Store.state.Explorer.project.resource_pack +
								'\\',
							''
						)
						.replace(/\\/g, '/')
					return `${path.dirname(tmp)}/${path.basename(
						tmp,
						path.extname(tmp)
					)}`
				})
			} catch (e) {
				return []
			}
		},
		item_png() {
			try {
				return walkSync(
					path.join(CURRENT.RP_PATH, 'textures/items')
				).map(e => {
					let tmp = e
						.replace(
							RP_BASE_PATH.replace(/\//g, '\\') +
								Store.state.Explorer.project.resource_pack +
								'\\',
							''
						)
						.replace(/\\/g, '/')
					return `${path.dirname(tmp)}/${path.basename(
						tmp,
						path.extname(tmp)
					)}`
				})
			} catch (e) {
				return []
			}
		},
		block_png() {
			try {
				return walkSync(
					path.join(CURRENT.RP_PATH, 'textures/blocks')
				).map(e => {
					let tmp = e
						.replace(
							RP_BASE_PATH.replace(/\//g, '\\') +
								Store.state.Explorer.project.resource_pack +
								'\\',
							''
						)
						.replace(/\\/g, '/')
					return `${path.dirname(tmp)}/${path.basename(
						tmp,
						path.extname(tmp)
					)}`
				})
			} catch (e) {
				return []
			}
		},
		model_png() {
			try {
				return walkSync(
					path.join(CURRENT.RP_PATH, 'textures/models')
				).map(e => {
					let tmp = e
						.replace(
							RP_BASE_PATH.replace(/\//g, '\\') +
								Store.state.Explorer.project.resource_pack +
								'\\',
							''
						)
						.replace(/\\/g, '/')
					return `${path.dirname(tmp)}/${path.basename(
						tmp,
						path.extname(tmp)
					)}`
				})
			} catch (e) {
				return []
			}
		},
		sound_file() {
			try {
				return walkSync(path.join(CURRENT.RP_PATH, 'sounds'))
					.map(e => {
						let tmp = e
							.replace(
								RP_BASE_PATH.replace(/\//g, '\\') +
									Store.state.Explorer.project.resource_pack +
									'\\',
								''
							)
							.replace(/\\/g, '/')
						return `${path.dirname(tmp)}/${path.basename(
							tmp,
							path.extname(tmp)
						)}`
					})
					.filter(e => !e.endsWith('.json'))
			} catch (e) {
				return []
			}
		},
		sound_definition() {
			try {
				return Object.keys(
					readJSONSync(
						path.join(
							CURRENT.RP_PATH,
							'sounds/sound_definitions.json'
						)
					).texture_data
				)
			} catch (e) {
				return []
			}
		},
	},
	animation_controller_ids() {
		try {
			return LightningCache.getCompiledSync().animation_controller.ids
		} catch (e) {}
	},
	animation_ids() {
		try {
			return LightningCache.getCompiledSync().animation.ids
		} catch (e) {}
	},
	siblings() {
		return PARENT_CONTEXT.toJSON()
	},
	children() {
		return NODE_CONTEXT.toJSON()
	},
	current_file_name() {
		try {
			let arr = TabSystem.getSelected()
				.file_path.split(/\/|\\/g)
				.pop()
				.split('.')
			arr.pop()
			return [arr.join('.')]
		} catch (e) {
			return 'unknown'
		}
	},
	loot_table_files() {
		try {
			return walkSync(path.join(CURRENT.PROJECT_PATH, 'loot_tables')).map(
				e => {
					return e
						.replace(
							BASE_PATH.replace(/\//g, '\\') +
								Store.state.Explorer.project.explorer +
								'\\',
							''
						)
						.replace(/\\/g, '/')
				}
			)
		} catch (e) {
			return []
		}
	},
	trade_table_files() {
		try {
			return walkSync(path.join(CURRENT.PROJECT_PATH, 'trading')).map(
				e => {
					return e
						.replace(
							BASE_PATH.replace(/\//g, '\\') +
								Store.state.Explorer.project.explorer +
								'\\',
							''
						)
						.replace(/\\/g, '/')
				}
			)
		} catch (e) {
			return []
		}
	},
	function_files() {
		try {
			return walkSync(path.join(CURRENT.PROJECT_PATH, 'functions')).map(
				e => {
					return e
						.replace(
							BASE_PATH.replace(/\//g, '\\') +
								Store.state.Explorer.project.explorer +
								'\\functions\\',
							''
						)
						.replace(/\\/g, '/')
						.replace('.mcfunction', '')
				}
			)
		} catch (e) {
			return []
		}
	},
}
