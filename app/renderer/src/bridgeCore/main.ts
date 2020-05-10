/**
 * Implements powerful custom add-on syntax
 */
import FileType from '../editor/FileType'
import TabSystem from '../TabSystem'
import OmegaCache from '../editor/OmegaCache'
import { JSONFileMasks } from '../editor/JSONFileMasks'
import path from 'path'
import CORE_FILES from './CORE_FILES'

import EntityHandler, { handleTags } from './EntityHandler'
import ItemHandler from './ItemHandler'
import TagHandler from './TagHandler'
import InformationWindow from '../UI/Windows/Common/Information'
import ComponentRegistry from '../plugins/CustomComponents'
import MapAreaHandler from './MapAreaHandler'
import trash from 'trash'
import { CURRENT } from '../constants'
import { use } from '../Utilities/useAttr'
import { parseFunction } from './functions/parse'
import { CommandRegistry } from '../plugins/CustomCommands'
import { updateCustomComponent } from './update/components'
import { updateCustomCommand } from './update/commands'

export interface OnSaveData {
	file_path: string
	file_name: string
	file_uuid: string
	data: any
	depth: number
	simulated_call: boolean
}

export const UI_DATA = {
	name: 'bridge. Core',
	author: 'bridge. Team',
	description:
		'A core library which improves your add-on experience with custom syntax.',
	version: '1.0.0',
	id: 'bridge.core',
}

export type TTextSaveHandler = (
	str: string,
	filePath: string
) => string | Promise<string>
export class BridgeCore {
	private static _isActive = false
	static saveRegistry: { [t: string]: (data: OnSaveData) => any } = {}
	static textSaveRegistry = new Map<string, TTextSaveHandler>()

	static isActive() {
		return this._isActive
	}
	static activate() {
		this._isActive = true
	}
	static deactivate() {
		this._isActive = false
	}
	static setSaveHandler(
		fileType: string,
		handler: (data: unknown) => unknown
	) {
		this.saveRegistry[fileType] = handler
	}
	static setTextSaveHandler(fileType: string, handler: TTextSaveHandler) {
		this.textSaveRegistry.set(fileType, handler)
	}

	static async onDelete(file_path: string) {
		let file_type = FileType.get(file_path)
		let file_uuid = await OmegaCache.loadFileUUID(file_path)

		switch (file_type) {
			case 'bridge_map_area': {
				await trash(
					path.join(
						CURRENT.PROJECT_PATH,
						`animation_controllers/bridge/map_area_${file_uuid}.json`
					)
				)
				try {
					await trash(
						path.join(
							CURRENT.PROJECT_PATH,
							`animations/bridge/map_area_timer_${file_uuid}.json`
						)
					)
				} catch (err) {}

				break
			}
			case 'item': {
				let player_file_path = path.join(
					CURRENT.PROJECT_PATH,
					'entities/player.json'
				)
				let a_c_file_path = path.join(
					CURRENT.PROJECT_PATH,
					`animation_controllers/bridge/custom_item_behavior.json`
				)
				let PLAYER_MASK = await JSONFileMasks.get(player_file_path)
				PLAYER_MASK.reset(`item_component@${file_uuid}`)
				let A_C_MASK = await JSONFileMasks.get(a_c_file_path)
				A_C_MASK.reset(file_uuid)

				await Promise.all([
					JSONFileMasks.apply(player_file_path),
					JSONFileMasks.generateFromMask(a_c_file_path, [
						'default/on_entry',
					]),
				])
				break
			}
		}
	}

	/**
	 * @param {boolean} simulated_call Whether the function call is coming from the JSONFileMasks.apply(...) method. The data received is not open inside of a tab
	 */
	static async beforeSave(
		data: any,
		file_path = TabSystem.getCurrentFilePath(),
		depth = 100,
		simulated_call = false,
		file_uuid?: string
	) {
		if (depth <= 0) {
			new InformationWindow('ERROR', 'Maximum import depth reached')
			return data
		}
		let file_name = path.basename(file_path)
		let file_type = FileType.get(file_path)
		if (file_uuid === undefined)
			file_uuid = await OmegaCache.loadFileUUID(file_path)

		/**
		 * Custom entity components & entity tags
		 * ---------
		 * Needs to be outside of the entity save handler because we need to have tags & components
		 * ready for the custom entity syntax pass. That's also why we apply tags and components before all other file masks
		 */
		if (file_type === 'entity') {
			//Load tags first (may contain custom components)
			await handleTags(
				file_path,
				use(data, 'minecraft:entity/description/tags'),
				simulated_call
			)
			data = await JSONFileMasks.applyOnData(
				file_path,
				data,
				layer_name => layer_name.startsWith('tag@')
			)
			//Then parse custom components
			await ComponentRegistry.parse(file_path, data, simulated_call)
			data = await JSONFileMasks.applyOnData(
				file_path,
				data,
				layer_name => layer_name.startsWith('component@')
			)
		}

		//Do not use custom syntax with deactivated bridgeCore
		if (!this._isActive) return data

		if (typeof this.saveRegistry[file_type] === 'function')
			await this.saveRegistry[file_type]({
				file_path,
				file_name,
				file_uuid,
				data,
				depth,
				simulated_call,
			})

		data = await JSONFileMasks.applyOnData(
			file_path,
			data,
			layer_name =>
				!(
					layer_name.startsWith('component@') ||
					layer_name.startsWith('tag@')
				)
		)
		await JSONFileMasks.saveMasks()
		return data
	}

	static async beforeTextSave(str: string, filePath: string) {
		if (!this._isActive) return str

		let fileType = FileType.get(filePath)

		return (
			(await this.textSaveRegistry.get(fileType)?.(str, filePath)) ?? str
		)
	}

	static get FILE_DEFS() {
		if (!this._isActive) return []
		return CORE_FILES
	}
}

//REGISTER HANDLERS
BridgeCore.setSaveHandler('entity', EntityHandler)
BridgeCore.setSaveHandler('item', ItemHandler)
BridgeCore.setSaveHandler('entity_tag', TagHandler)
BridgeCore.setSaveHandler('bridge_map_area', MapAreaHandler)
BridgeCore.setTextSaveHandler('function', parseFunction)
BridgeCore.setTextSaveHandler('custom_component', updateCustomComponent)
BridgeCore.setTextSaveHandler('custom_command', updateCustomCommand)
