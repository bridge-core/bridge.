import TabSystem from '../TabSystem'
import { promises as fs } from 'fs'
import { RP_BASE_PATH, BASE_PATH } from '../constants'
import { readJSON } from './JsonFS'
import path from 'path'
import Store from '../../store/index'

let last_selected: string
let last_result: string

export const NEGATIVE_RESPONSES = [
	'/@NO-RP@/',
	'/@NO-DEPENDENCY@/',
	'/@NO-BP@/'
]

export function setRP(val: string) {
	last_result = val
}

export default async function findRP() {
	let selected = TabSystem.project
	if (selected === undefined)
		return '/@NO-BP@/'
	if (selected === last_selected && last_result !== undefined)
		return last_result
	last_selected = selected

	let manifest
	let uuid
	try {
		manifest = await readJSON(
			path.join(BASE_PATH, selected, 'manifest.json')
		)
		uuid = manifest.dependencies[0].uuid
	} catch (e) {
		last_result = '/@NO-DEPENDENCY@/'
		return '/@NO-DEPENDENCY@/'
	}

	let rps = await fs.readdir(RP_BASE_PATH)
	let rp_data = await Promise.all(
		rps.map(rp =>
			readJSON(path.join(RP_BASE_PATH, rp, 'manifest.json')).catch(
				err => {
					return undefined
				}
			)
		)
	)

	for (let i = 0; i < rp_data.length; i++) {
		if (rp_data[i] !== undefined && rp_data[i].header.uuid === uuid) {
			last_result = rps[i]
			return rps[i]
		}
	}

	last_result = '/@NO-RP@/'
	return '/@NO-RP@/'
}

export async function trySetRP() {
	let resp = await findRP()
	if (NEGATIVE_RESPONSES.includes(resp)) return false

	Store.commit('setExplorerProject', {
		store_key: 'resource_pack',
		project: resp,
	})
	return true
}
