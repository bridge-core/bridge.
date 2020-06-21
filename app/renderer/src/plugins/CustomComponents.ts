import FetchDefinitions from '../editor/FetchDefinitions'
import { JSONFileMasks, JSONMask } from '../editor/JSONFileMasks'
import InformationWindow from '../UI/Windows/Common/Information'
import EventBus from '../EventBus'
import { use } from '../Utilities/useAttr'
import { detachMerge } from '../Utilities/mergeUtils'
import LightningCache from '../editor/LightningCache'
import FileType from '../editor/FileType'
import { ContextEnv } from './scripts/modules/env'

export interface BridgeComponentClass {
	component_name: string

	new (): BridgeComponent
}

export class BridgeComponent {
	static component_name = 'bridge:demo_component'

	onApply(data: any, location: string) {}
	onPropose() {}
}

export default class ComponentRegistry {
	static components: { [s: string]: BridgeComponent } = {}
	static registerUpdates = new Set<string>()

	static async register(Component: BridgeComponentClass) {
		let name = Component.component_name
		if (!name || name.startsWith('minecraft:'))
			throw new Error("Invalid component namespace: 'minecraft:'!")

		this.components[name] = new Component()
		if (typeof this.components[name].onApply !== 'function')
			this.components[name].onApply = () => {}
		if (typeof this.components[name].onPropose !== 'function')
			this.components[name].onPropose = () => {}

		//UPDATE ALL REFERENCES TO COMPONENT
		let refs = await FetchDefinitions.fetchSingle(
			'entity',
			['custom_components'],
			name,
			true
		)
		refs.forEach(ref => this.registerUpdates.add(ref))
	}
	static async updateFiles() {
		for (let f of this.registerUpdates) await JSONFileMasks.apply(f)

		this.registerUpdates.clear()
	}
	static async reset() {
		this.components = {}
	}

	static set(
		MASK: JSONMask,
		component_name: string,
		component_data = {},
		simulated_call = false,
		location = 'components'
	) {
		if (this.components[component_name] === undefined)
			return new InformationWindow(
				'ERROR',
				`Unknown component "${component_name}"!`
			)
		//ADD LOCATION TO CONTEXT ENV
		ContextEnv.value.location = location

		//Save that this file is using the specific custom component inside the LightningCache
		EventBus.once(
			'bridge:onCacheHook[entity.custom_components]',
			() => component_name
		)

		let apply_data = this.components[component_name].onApply(
			component_data,
			location
		)
		if (typeof apply_data !== 'object' || Array.isArray(apply_data)) return
		MASK.overwrite(`component@${component_name}`, apply_data)
	}

	static async parse(file_path: string, data: any, simulated_call?: boolean) {
		if (data === undefined || data['minecraft:entity'] === undefined) return
		const MASK = await JSONFileMasks.get(file_path)
		const entityIdentifier = use(
			data,
			'minecraft:entity/description/identifier',
			false
		)

		//RESET OLD CHANNELS
		let { custom_components } =
			(await LightningCache.loadType(
				file_path,
				FileType.get(file_path)
			)) || {}
		;(custom_components || []).forEach(c => MASK.reset(`component@${c}`))

		//SETUP PLUGIN API ENV
		ContextEnv.value = {
			entityIdentifier,
		}

		//PROCESS CUSTOM COMPONENTS
		for (let component_name in this.components) {
			//CHECK "COMPONENTS"
			let c = use(data, `minecraft:entity/components/${component_name}`)

			if (c !== undefined)
				this.set(MASK, component_name, c, simulated_call, 'components')

			//CHECK "COMPONENT_GROUPS"
			for (let component_group in data['minecraft:entity']
				.component_groups || {}) {
				let c = use(
					data,
					`minecraft:entity/component_groups/${component_group}/${component_name}`
				)

				if (c !== undefined)
					this.set(
						MASK,
						component_name,
						c,
						simulated_call,
						component_group
					)
			}
		}

		//Trigger LightningCache update if simulated_call
		if (simulated_call)
			await LightningCache.triggerHook(
				file_path,
				'custom_components',
				'entity.custom_components'
			)

		//RESET CONTEXT ENV
		ContextEnv.value = {}
	}

	static propose() {
		let res = {}

		for (let component_name in this.components) {
			let propose_data = this.components[component_name].onPropose()
			if (typeof propose_data !== 'object') continue

			res = detachMerge(res, propose_data)
		}

		return res
	}
}
