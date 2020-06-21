import { CONTEXT_UP, CONTEXT_DOWN } from '../Dynamic'
import Provider from '../Provider'
import TabSystem from '../../TabSystem'
import { compare, CompareOperator } from 'compare-versions'
import { Omega } from '../Omega'
import { detachMerge } from '../../Utilities/mergeUtils'

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
		for (let i = 0; i < path_arr.length + 1; i++) CONTEXT_UP()
		let { object: template } = compileVersionedTemplate(
			current.$versioned_template
		)
		for (let i = 0; i < path_arr.length + 1; i++) CONTEXT_DOWN()
		//Template is undefined if path is_data_path
		return provider.walk(path_arr, (template || {})[key])
	}
}

interface IVersionedTemplate {
	$if: string
	$data: any
}

export function compileVersionedTemplate(template: IVersionedTemplate[]) {
	let resObject: any = {},
		resValue: string[] = []

	for (let { $if, $data } of template) {
		if (!$if || compileCondition($if)) {
			if (typeof $data === 'string') {
				const { object, value } = Omega.eval($data)
				resObject = detachMerge(resObject, object)
				resValue.push(...value)
			} else {
				if (Array.isArray($data)) resValue.push(...($data as string[]))
				else resObject = detachMerge(resObject, $data)
			}
		}
	}

	return { object: resObject, value: resValue }
}

export function compileCondition(condition: string) {
	let conds = condition.split(/\s+and\s+/)
	for (const cond of conds) if (!compileSingleCondition(cond)) return false
	return true
}

export function compileSingleCondition(condition: string) {
	let [v1, operator, v2] = condition.split(/\s+/)
	if (v1 === '$format_version')
		v1 = TabSystem.getSelected()
			.content.get('format_version')
			.toJSON()
	if (v2 === '$format_version')
		v1 = TabSystem.getSelected()
			.content.get('format_version')
			.toJSON()

	if (['>', '>=', '=', '<', '<='].includes(operator))
		return compare(v1, v2, <CompareOperator>operator)
	else throw new Error(`Undefined format_version operator: "${operator}"`)
}
