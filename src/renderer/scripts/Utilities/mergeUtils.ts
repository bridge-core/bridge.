/**
 * Utilities for merging objects
 */
import deepmerge from 'deepmerge'
import objMerge, { objMergeAll } from './objMerge'

const ARRAY_MERGE = (target: any[], source: any[]) => {
	let tmp: any[] = []
	source.forEach(e => {
		if (typeof e !== 'object') tmp.push(e)
		else tmp.push(detachObj({}, e))
	})
	target.forEach(e => {
		if (typeof e !== 'object') tmp.push(e)
		else tmp.push(detachObj({}, e))
	})
	return tmp
}
const ARRAY_OVERWRITE = (target: any[], source: any[]) => {
	let tmp: any[] = []
	source.forEach(e => {
		if (typeof e !== 'object') tmp.push(e)
		else tmp.push(detachObj({}, e))
	})
	return tmp
}
const PUSH_ONCE = (target: any[], source: any[]) => {
	let res: any[] = []

	target.concat(source).forEach(e => {
		if (!res.includes(e)) res.push(e)
	})

	return res
}

const detachObj = (...objs: any[]) => {
	if (objs.length == 1)
		return deepmerge({}, objs[0], { arrayMerge: ARRAY_OVERWRITE })
	if (objs.length == 2)
		return deepmerge(objs[0], objs[1], { arrayMerge: ARRAY_OVERWRITE })
	return deepmerge.all(objs, { arrayMerge: ARRAY_OVERWRITE })
}
const detachMerge = (...objs: any[]) => {
	if (objs.length == 1)
		return deepmerge({}, objs[0], { arrayMerge: ARRAY_MERGE })
	if (objs.length == 2)
		return deepmerge(objs[0], objs[1], { arrayMerge: ARRAY_MERGE })
	return deepmerge.all(objs, { arrayMerge: ARRAY_MERGE })
}

/**
 * Used specifically by JSONFileMasks
 */
export interface MergeArrayConfig {
	[s: string]: (o1: any, o2: any) => any[]
}

const maskChannelMerge = (
	obj1: any,
	obj2: any,
	merge_arrays: string[] | MergeArrayConfig
) => {
	return objMerge(obj1, obj2, {
		custom_merge: (o1, o2, key, path) => {
			if (!Array.isArray(o1) || !Array.isArray(o2)) return

			if (Array.isArray(merge_arrays)) {
				if (merge_arrays.find(e => path.includes(e)))
					return o1.concat(o2)
			} else {
				for (let key in merge_arrays) {
					if (path.includes(key)) return merge_arrays[key](o1, o2)
				}
			}
		},
	})
}
const maskMerge = (arr: any[], overwrite_arrays: string[] = []) => {
	return objMergeAll(arr, {
		custom_merge: (o1: any, o2: any, key: string, path: string) => {
			// console.log(overwrite_arrays, path, o1, o2);
			if (!Array.isArray(o1) || !Array.isArray(o2)) return

			if (overwrite_arrays.find((e: string) => path.includes(e))) {
				return o2
			}
		},
		array_merge: (o1: any[], o2: any[]) => {
			if (Array.isArray(o1) && Array.isArray(o2)) return o1.concat(o2)
			else if (Array.isArray(o1)) return o1.concat([o2])
			else return o2.concat([o1])
		},
	})
}

export default detachObj
export { detachMerge, detachObj, maskChannelMerge, maskMerge, PUSH_ONCE }
