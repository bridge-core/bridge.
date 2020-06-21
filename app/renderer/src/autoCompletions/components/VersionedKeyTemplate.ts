import { CONTEXT_UP, CONTEXT_DOWN } from '../Dynamic'
import Provider from '../Provider'
import { compileVersionedTemplate } from './VersionedTemplate'

export class VersionedKeyTemplate {
	static confirm(
		provider: Provider,
		key: string,
		path_arr: string[],
		current: any
	) {
		return current['$versioned_template.' + key] !== undefined
	}
	static process(
		provider: Provider,
		key: string,
		path_arr: string[],
		current: any
	): any {
		let { object: template } = compileVersionedTemplate(
			current['$versioned_template.' + key]
		)
		//Template is undefined if path is_data_path
		return provider.walk(path_arr, template || {})
	}
}
