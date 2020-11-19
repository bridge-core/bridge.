import { detachMerge } from '../../../Utilities/mergeUtils'
import { Omega } from '../../Omega'
import { compare, CompareOperator } from 'compare-versions'
import TabSystem from '../../../TabSystem'
import ProjectConfig from '../../../Project/Config'
import Provider from '../../Provider'

interface IVersionedTemplate {
	$if?: string
	$legacy_if?: string //Allows usage of legacy dynamic_template $if hooks into the DYNAMIC lib
	$data: any
}

let provider: Provider

export function getFormatVersions() {
	if (!provider) provider = new Provider(undefined, '')
	return provider.get('general/format_version').value
}

export function compileVersionedTemplate(template: IVersionedTemplate[]) {
	let resObject: any = {},
		resValue: string[] = []
	let hasTruthyCondition = false

	for (let { $if, $legacy_if, $data } of template) {
		if (
			(!$if || compileCondition($if)) &&
			(!$legacy_if || Omega.walk($legacy_if))
		) {
			hasTruthyCondition = true

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

	if (!hasTruthyCondition) return { object: undefined, value: undefined }
	return { object: resObject, value: resValue }
}

export function compileCondition(condition: string) {
	let conds = condition.split(/\s+and\s+/)
	for (const cond of conds) if (!compileSingleCondition(cond)) return false
	return true
}

export function compileSingleCondition(condition: string) {
	let [v1, operator, v2] = condition.split(/\s+/)
	if (v1 === '$format_version') v1 = getFormatVersion()
	if (v2 === '$format_version') v2 = getFormatVersion()
	if (v1 === '$project_target_version')
		v1 = ProjectConfig.getFormatVersionSync()
	if (v2 === '$project_target_version')
		v2 = ProjectConfig.getFormatVersionSync()

	if (!v1 || !v2) return false
	if (['>', '>=', '=', '<', '<='].includes(operator))
		return compare(v1, v2, <CompareOperator>operator)
	else throw new Error(`Undefined format_version operator: "${operator}"`)
}

function getFormatVersion() {
	let version
	try {
		version = TabSystem.getSelected()
			.content.get('format_version')
			.toJSON()
	} catch {
		version = ProjectConfig.getFormatVersionSync()
	}
	if (typeof version === 'object')
		version = ProjectConfig.getFormatVersionSync()
	if (typeof version === 'number') version = version.toString()
	return version
}
