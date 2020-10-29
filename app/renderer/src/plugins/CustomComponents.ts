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
	type?: 'entity' | 'block'

	new (): BridgeComponent
}

export class BridgeComponent {
	static component_name = 'bridge:demo_component'
	static type = 'entity'

	onApply(data: any, location: string) {}
	onPropose() {}
}

export default class ComponentRegistry {
	static components: Record<string, BridgeComponent> = {}
	static blockComponents = new Map<string, BridgeComponent>()
	static registerUpdates = new Set<string>()

	static async register(Component: BridgeComponentClass) {
		let name = Component.component_name
		if (!name || name.startsWith('minecraft:'))
			throw new Error("Invalid component namespace: 'minecraft:'!")

		let componentInstance = new Component()
		if (typeof componentInstance.onApply !== 'function')
			componentInstance.onApply = () => {}
		if (typeof componentInstance.onPropose !== 'function')
			componentInstance.onPropose = () => {}

		if (Component.type === 'entity' || Component.type === undefined)
			this.components[name] = componentInstance
		else if (Component.type === 'block')
			this.blockComponents.set(name, componentInstance)
		else throw new Error(`Invalid component type: ${Component.type}`)

		//UPDATE ALL REFERENCES TO COMPONENT
		let refs = await FetchDefinitions.fetchSingle(
			Component.type ?? 'entity',
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
	static async updateFiles(commandUpdates?: Set<string>) {
		this.registerUpdates = new Set(
			[...this.registerUpdates].filter(
				x => !commandUpdates || !commandUpdates.has(x)
			)
		)
		// console.log(Object.entries(this.components))
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

		let apply_data: any = {}
		try {
			apply_data = this.components[component_name].onApply(
				component_data,
				location
			)
		} catch (err) {
			createErrorNotification(err)
		}

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

	static async parseBlock(
		filePath: string,
		data: any,
		simulatedCall?: boolean
	) {
		if (data === undefined || data['minecraft:block'] === undefined) return
		const MASK = await JSONFileMasks.get(filePath)
		const blockIdentifier = use(
			data,
			'minecraft:block/description/identifier',
			false
		)

		//RESET OLD CHANNELS
		MASK.keep(channelName => !channelName.startsWith('component@'))

		//SETUP PLUGIN API ENV
		ContextEnv.value = {
			blockIdentifier,
		}

		const usedComponents: string[] = []
		//PROCESS CUSTOM COMPONENTS
		for (let [componentName, component] of this.blockComponents) {
			//CHECK "COMPONENTS"
			let c = use(data, `minecraft:block/components/${componentName}`)

			if (c !== undefined) {
				usedComponents.push(componentName)
				let data: any = {}
				try {
					data = component.onApply(c, 'components')
				} catch (err) {
					createErrorNotification(err)
				}

				if (typeof data === 'object')
					MASK.set(`component@${componentName}`, data)
				else
					throw new Error(`Invalid type of applyData: ${typeof data}`)
			}
		}

		once(
			'bridge:onCacheHook[block.custom_components]',
			() => usedComponents
		)

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

	static propose(typeFilter?: 'entity' | 'block') {
		if (typeFilter === 'block') {
			let res = {}

			for (let [componentName, component] of this.blockComponents) {
				let proposeData = component.onPropose()
				if (typeof proposeData !== 'object') continue

				res = detachMerge(res, proposeData)
			}

			return res
		} else {
			let res = {}

			for (let component_name in this.components) {
				let propose_data = this.components[component_name].onPropose()
				if (typeof propose_data !== 'object') continue

				res = detachMerge(res, propose_data)
			}

			return res
		}
	}
}
