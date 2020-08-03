import { use, set, uuid } from '../Utilities/useAttr'
import AnimationController from '../files/AnimationController'
import { CURRENT } from '../constants'
import { join } from 'path'
import FetchDefinitions from '../editor/FetchDefinitions'
import FileSystem from '../FileSystem'
import { JSONFileMasks } from '../editor/JSONFileMasks'
import { transformTag } from './TagHandler'
import LightningCache from '../editor/LightningCache'
import FileType from '../editor/FileType'
import { OnSaveData } from './main'
import { transformJsonCommands } from './functions/transformJson'

let COM_ID_COUNTER = 0
let A_C: AnimationController
let COMMAND_ANIM_REGISTERED = false

async function transformEvent(
	event: any,
	{
		component_groups,
		description,
		events,
		file_name,
		file_uuid,
	}: Partial<
		OnSaveData & { component_groups: any; description: any; events: any }
	>
) {
	//SPELL EFFECTS
	let effect_id = uuid()
	let add_effects = use(event, 'add/spell_effects')
	if (add_effects !== undefined) {
		set(event, 'add/component_groups', [effect_id])
		set(component_groups, effect_id, {
			'minecraft:spell_effects': {
				add_effects: add_effects,
			},
		})
	}
	let remove_effects = use(event, 'remove/spell_effects')
	if (remove_effects !== undefined) {
		if (add_effects === undefined)
			set(event, 'add/component_groups', [effect_id])
		set(component_groups, effect_id, {
			'minecraft:spell_effects': {
				remove_effects: remove_effects,
			},
		})
	}

	//GROUP
	let g = use(event, 'add/group')
	if (g !== undefined) {
		let group_name =
			(typeof g.name !== 'object' ? g.name : uuid()) || uuid()
		set(event, 'add/component_groups', [group_name])
		set(component_groups, group_name, g.components || {})
	}

	//EXECUTE COMMANDS
	let { commands: e_c } = use(event, 'execute') || {}
	if (e_c !== undefined) {
		let e_c_group = `execute_command_id_${++COM_ID_COUNTER}`

		if (!COMMAND_ANIM_REGISTERED) {
			set(description, 'scripts/animate', ['bridge_execute_commands'])
			COMMAND_ANIM_REGISTERED = true
		}

		set(description, 'animations', {
			bridge_execute_commands: `controller.animation.bridge_${file_name}.execute_commands`,
		})
		set(component_groups, `bridge:${e_c_group}`, {
			'minecraft:skin_id': {
				value: COM_ID_COUNTER,
			},
		})
		set(component_groups, 'bridge:execute_no_command', {
			'minecraft:skin_id': {
				value: 0,
			},
		})
		set(event, 'add/component_groups', [`bridge:${e_c_group}`])
		set(events, 'bridge:remove_command_id_' + COM_ID_COUNTER, {
			add: {
				component_groups: ['bridge:execute_no_command'],
			},
			remove: {
				component_groups: [`bridge:${e_c_group}`],
			},
		})

		set(
			A_C,
			`animation_controllers/controller.animation.bridge_${file_name}.execute_commands/states`,
			{
				default: {
					transitions: [
						{ [e_c_group]: `query.skin_id == ${COM_ID_COUNTER}` },
					],
				},
				[e_c_group]: {
					transitions: [
						{ default: `query.skin_id != ${COM_ID_COUNTER}` },
					],
					on_entry: (
						await transformJsonCommands(file_uuid, e_c)
					).concat(['@s bridge:remove_command_id_' + COM_ID_COUNTER]),
				},
			}
		)
	}

	if (event.sequence !== undefined)
		await Promise.all(
			event.sequence.map((e: any) =>
				transformEvent(e, {
					component_groups,
					description,
					events,
					file_name,
					file_uuid,
				})
			)
		)
	if (event.randomize !== undefined)
		await Promise.all(
			event.randomize.map((e: any) =>
				transformEvent(e, {
					component_groups,
					description,
					events,
					file_name,
					file_uuid,
				})
			)
		)
}

export async function handleTags(
	file_path: string,
	tags: string[] = [],
	simulated_call: boolean
) {
	if (simulated_call) return
	const MASK = await JSONFileMasks.get(file_path)

	//RESET OLD CHANNELS
	let { bridge_core_tags } =
		(await LightningCache.loadType(file_path, FileType.get(file_path))) ||
		{}
	;(bridge_core_tags || []).forEach(t => MASK.reset(`tag@${t}`))

	if (!Array.isArray(tags) || tags.length === 0) return

	const tagRefs = await Promise.all(
		tags.map(t =>
			FetchDefinitions.fetchSingle('entity_tag', ['identifiers'], t, true)
		)
	)

	await Promise.all(
		tagRefs.flat().map(async ref => {
			const { identifier, ...tag_entity } =
				transformTag(await FileSystem.loadFile(ref)) || {}
			if (!identifier) return
			MASK.overwrite(`tag@${identifier}`, tag_entity || {})
		})
	)
}

export default async function EntityHandler({
	file_name,
	data,
	file_uuid,
	file_path,
	simulated_call,
}: OnSaveData) {
	let entity = data['minecraft:entity']
	if (!entity) return
	set(entity, 'component_groups', {})
	set(entity, 'events', {})
	set(entity, 'components', {})
	let { components, component_groups, events, description } = entity
	COM_ID_COUNTER = 0
	COMMAND_ANIM_REGISTERED = false
	A_C = new AnimationController()

	for (let e in events)
		await transformEvent(events[e], {
			component_groups,
			description,
			events,
			file_uuid,
			file_name: file_name.replace('.json', ''),
		})

	await A_C.save(
		join(
			CURRENT.PROJECT_PATH,
			`animation_controllers/bridge/commands_${file_name}`
		)
	)
}
