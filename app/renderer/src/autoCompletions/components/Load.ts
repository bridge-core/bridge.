import { DynamicKeyTemplate } from './DynamicKeyTemplate'
import Provider from '../Provider'
import { CONTEXT_DOWN, CONTEXT_UP } from '../Dynamic'

export class Load {
	static confirm(
		provider: Provider,
		key: string,
		path_arr: string[],
		current: any
	) {
		return current.$load !== undefined
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
		if (DynamicKeyTemplate.confirm(provider, key, path_arr, object))
			return DynamicKeyTemplate.process(provider, key, path_arr, object)

		for (let k of Object.keys(object)) {
			if (k[0] === '$') {
				for (let i = 0; i < path_arr.length + 1; i++) CONTEXT_UP()
				let { object: object2, value } = provider.omegaExpression(k)
				for (let i = 0; i < path_arr.length + 1; i++) CONTEXT_DOWN()

				if (value.includes(key) || object2[key] !== undefined)
					return provider.walk(path_arr, object[k])
			}
		}
	}
	static walk(path_arr: string[], arg1: any): any {
		throw new Error('Method not implemented.')
	}
	static omegaExpression(k: string): { object: any; value: any } {
		throw new Error('Method not implemented.')
	}
}
