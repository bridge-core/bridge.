import { JSONFileMasks, JSONMask } from '../editor/JSONFileMasks'
import { CURRENT } from '../constants'
import path, { join, dirname } from 'path'
import { set } from '../Utilities/useAttr'
import ItemEquippedSensor from './item/ItemEquippedSensor'
import { OnSaveData } from './main'
import { promises as fs } from 'fs'
declare const __static: string

export type ItemComponentData = Partial<
	OnSaveData & {
		PLAYER_MASK: JSONMask
		A_C_MASK: JSONMask
		component_name: string
		component: any
		identifier: string
		item_id?: string
	}
>

export async function transformComponents({
	PLAYER_MASK,
	A_C_MASK,
	component_name,
	component,
	identifier = 'bridge:unknown',
	file_uuid,
}: ItemComponentData) {
	let item_id = identifier.split(':').pop()

	if (component_name === 'bridge:item_equipped_sensor') {
		ItemEquippedSensor({
			PLAYER_MASK,
			A_C_MASK,
			component_name,
			component,
			identifier,
			file_uuid,
			item_id,
		})
	}
}

export default async function ItemHandler({ file_uuid, data }: OnSaveData) {
	//FILE PATHS
	let player_file_path = path.join(
		CURRENT.PROJECT_PATH,
		'entities/player.json'
	)
	let a_c_file_path = path.join(
		CURRENT.PROJECT_PATH,
		`animation_controllers/bridge/custom_item_behavior.json`
	)

	//Make sure player file exists
	try {
		await fs.stat(player_file_path)
	} catch {
		await fs.mkdir(dirname(player_file_path), { recursive: true })
		await fs.copyFile(
			join(__static, 'vanilla/BP/entities/player.json'),
			player_file_path
		)
	}

	//DATA
	let item = data['minecraft:item']
	if (!item) return
	set(item, 'components', {})
	set(item, 'description', {})
	let { components, description } = item

	//ADDITIONAL FILES
	let PLAYER_MASK = await JSONFileMasks.get(player_file_path)
	PLAYER_MASK.reset(`item_component@${file_uuid}`)
	let A_C_MASK = await JSONFileMasks.get(a_c_file_path)
	A_C_MASK.reset(file_uuid)
	A_C_MASK.set(file_uuid, {
		format_version: '1.10.0',
		animation_controllers: {
			'controller.animation.bridge_custom_item_behavior': {
				states: { default: {} },
			},
		},
	})

	//READ COMPONENTS
	const promises = []
	for (let c in components) {
		promises.push(
			transformComponents({
				component_name: c,
				component: components[c],
				identifier: description.identifier || 'bridge:no_identifier',
				PLAYER_MASK,
				A_C_MASK,
				file_uuid,
			})
		)
	}
	await Promise.all(promises)

	//SAVE ADDITIONAL FILES
	await Promise.all([
		JSONFileMasks.apply(player_file_path),
		JSONFileMasks.generateFromMask(a_c_file_path, ['default/on_entry']),
	])
}
