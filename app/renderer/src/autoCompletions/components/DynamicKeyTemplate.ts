import { CONTEXT_UP, CONTEXT_DOWN } from '../Dynamic'
import Provider from '../Provider'

export class DynamicKeyTemplate {
	static confirm(
		provider: Provider,
		key: string,
		path_arr: string[],
		current: any
	) {
		return current['$dynamic_template.' + key] !== undefined
	}
	static process(
		provider: Provider,
		key: string,
		path_arr: string[],
		current: any
	): any {
		for (let i = 0; i < path_arr.length; i++) CONTEXT_UP()
		let template = provider.compileTemplate(
			current['$dynamic_template.' + key]
		)
		for (let i = 0; i < path_arr.length; i++) CONTEXT_DOWN()

		return provider.walk(path_arr, template)
	}
}
