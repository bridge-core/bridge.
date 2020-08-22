import FetchDefinitions from '../editor/FetchDefinitions'
import { JSONFileMasks, JSONMask } from '../editor/JSONFileMasks'
import { use } from '../Utilities/useAttr'
import { detachMerge } from '../Utilities/mergeUtils'
import LightningCache from '../editor/LightningCache'
import FileType from '../editor/FileType'
import { ContextEnv } from './scripts/modules/env'
import { once } from '../AppCycle/EventSystem'
import { createErrorNotification } from '../AppCycle/Errors'

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
	static components: Record<string, BridgeComponent> = {}
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

		return {
			dispose: () => {
				delete this.components[name]
			},
		}
	}
	static async updateFiles() {
		console.log(Object.entries(this.components))
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
		if (this.components[component_name] === undefined) {
			createErrorNotification(
				new Error(`Unknown component: "${component_name}"`)
			)
			return
		}
		//ADD LOCATION TO CONTEXT ENV
		ContextEnv.value.location = location

		//Save that this file is using the specific custom component inside the LightningCache

		let apply_data = this.components[component_name].onApply(
			component_data,
			location
		)
		if (typeof apply_data !== 'object' || Array.isArray(apply_data)) {
			createErrorNotification(
				new Error(`Invalid data for component "${component_name}"`)
			)
		} else {
			MASK.set(`component@${component_name}`, apply_data)
		}

		return component_name
	}

	static async parse(filePath: string, data: any, simulatedCall?: boolean) {
		if (data === undefined || data['minecraft:entity'] === undefined) return
		const MASK = await JSONFileMasks.get(filePath)
		const entityIdentifier = use(
			data,
			'minecraft:entity/description/identifier',
			false
		)

		//RESET OLD CHANNELS
		MASK.keep(channelName => !channelName.startsWith('component@'))

		//SETUP PLUGIN API ENV
		ContextEnv.value = {
			entityIdentifier,
		}

		const usedComponents: string[] = []
		//PROCESS CUSTOM COMPONENTS
		for (let component_name in this.components) {
			//CHECK "COMPONENTS"
			let c = use(data, `minecraft:entity/components/${component_name}`)

			if (c !== undefined)
				usedComponents.push(
					this.set(
						MASK,
						component_name,
						c,
						simulatedCall,
						'components'
					)
				)

			//CHECK "COMPONENT_GROUPS"
			for (let component_group in data['minecraft:entity']
				.component_groups || {}) {
				let c = use(
					data,
					`minecraft:entity/component_groups/${component_group}/${component_name}`
				)

				if (c !== undefined)
					usedComponents.push(
						this.set(
							MASK,
							component_name,
							c,
							simulatedCall,
							component_group
						)
					)
			}
		}

		this.setCacheHook(usedComponents)

		//RESET CONTEXT ENV
		ContextEnv.value = {}

		return usedComponents
	}

	static setCacheHook(componentNames: string[]) {
		once(
			'bridge:onCacheHook[entity.custom_components]',
			() => componentNames
		)
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
