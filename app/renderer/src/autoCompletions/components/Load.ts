import ComponentProvider from '../Components'
import Provider from '../Provider'

export class Load {
	static confirm(
		provider: Provider,
		key: string,
		path_arr: string[],
		current: any
	) {
		if (!current.$load) return false

		const { object = {}, value = [] } =
			this.process(provider, key, [...path_arr], current) ?? {}
		return Object.keys(object).length > 0 || value.length > 0
	}
	static process(
		provider: Provider,
		key: string,
		path_arr: string[],
		current: any
	): any {
		let { object } = provider.omegaExpression(current.$load)
		if (object[key] !== undefined)
			return provider.walk(path_arr, object[key])

		path_arr.unshift(key)
		return provider.walk(path_arr, object)
	}

	static walk(path_arr: string[], arg1: any): any {
		throw new Error('Method not implemented.')
	}
	static omegaExpression(k: string): { object: any; value: any } {
		throw new Error('Method not implemented.')
	}
}
