import saveEval from 'safe-eval'
import JSONTree from './JsonTree'

function private_toJSON(
	tree: JSONTree,
	build_arrays?: boolean,
	default_build_arrays = false
) {
	if (tree.data !== '' && tree.children.length === 0) {
		return toCorrectType(tree.data)
	} else {
		if (build_arrays && tree.is_array) {
			let arr: any[] = []
			tree.children.forEach(c => {
				if (!c.is_active) return

				arr.push(private_toJSON(c.identity(), build_arrays))
			})
			return arr
		} else {
			if (default_build_arrays && tree.children.length === 0) return []
			let obj: any = {}
			tree.children.forEach(c => {
				if (!c.is_active) return

				obj[c.key] = private_toJSON(c.identity(), build_arrays)
			})
			return obj
		}
	}
}

function getType(data: any) {
	if (Array.isArray(data)) return 'array'
	return typeof data
}

export function toCorrectType(val: any) {
	if (val === '') return ''
	if (val == 'true' || val == 'false') return val == 'true'
	if (!Number.isNaN(Number(val)) && typeof val != 'boolean')
		return Number(val)
	if (val == 'undefined') return undefined
	return val
}

function parse(string: string) {
	try {
		return saveEval(string)
	} catch (e) {
		console.error(e)
	}
}

export class Format {
	static toJSON(
		tree: JSONTree,
		build_arrays = true,
		default_build_arrays = false
	) {
		return private_toJSON(tree, build_arrays, default_build_arrays)
	}

	static toTree(obj: any, file_path = '') {
		let tree = new JSONTree('global').buildFromObject(obj)
		tree.loadMeta(file_path, true)
		return tree
	}
}

export default {
	Format,
	parse,
	getType,
	toCorrectType,
}
