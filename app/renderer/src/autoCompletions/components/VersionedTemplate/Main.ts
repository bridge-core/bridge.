import Provider from '../../Provider'
import { compileVersionedTemplate } from './Common'

export class VersionedTemplate {
	static confirm(
		provider: Provider,
		key: string,
		path_arr: string[],
		current: any
	) {
		return current.$versioned_template !== undefined
	}
	static process(
		provider: Provider,
		key: string,
		path_arr: string[],
		current: any
	): any {
		let { object: template } = compileVersionedTemplate(
			current.$versioned_template
		)

		//Template is undefined if path is_data_path
		return provider.walk(path_arr, (template || {})[key])
	}
}
