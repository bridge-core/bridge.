import Placeholder from './components/Placeholder'
import { Load } from './components/Load'
import { DynamicTemplate } from './components/DynamicTemplate'
import { DynamicKeyTemplate } from './components/DynamicKeyTemplate'
import Provider from './Provider'
import { VersionedTemplate } from './components/VersionedTemplate'

const COMPONENTS = [
	Load,
	DynamicKeyTemplate,
	DynamicTemplate,
	VersionedTemplate,
	Placeholder,
]

export default class ComponentProvider {
	static process(
		provider: Provider,
		key: string,
		path_arr: string[],
		current: any
	) {
		for (let component of COMPONENTS) {
			if (component.confirm(provider, key, path_arr, current))
				return component.process(provider, key, path_arr, current)
		}
	}
}
