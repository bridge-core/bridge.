import { BASE_PATH, RP_BASE_PATH } from '../constants'
import InformationWindow from '../UI/Windows/Common/Information'
import LoadingWindow from '../../windows/LoadingWindow'
import findRP, { setRP } from './FindRP'
import EventBus from '../EventBus'
import { writeJSON, readJSON } from './JsonFS'

export default class PackLinker {
	static async link(bp_name: string, rp_name: string) {
		let lw = new LoadingWindow()
		try {
			let bp_data = await readJSON(`${BASE_PATH}${bp_name}/manifest.json`)
			let rp_data = await readJSON(
				`${RP_BASE_PATH}${rp_name}/manifest.json`
			)

			bp_data.dependencies = [
				{
					version: rp_data.header.version,
					uuid: rp_data.header.uuid,
				},
			]

			await writeJSON(
				`${BASE_PATH}${bp_name}/manifest.json`,
				bp_data,
				true
			)
			await setRP(rp_name)
			EventBus.trigger('bridge:refreshExplorer', rp_name)
			lw.close()
		} catch (e) {
			lw.close()
			new InformationWindow(
				'Unable to link packs',
				`bridge. failed to link the packs ${bp_name} and ${rp_name}. ${e.message}`
			)
		}
	}

	static async unlink(bp_name: string) {
		let lw = new LoadingWindow()
		try {
			let bp_data = await readJSON(`${BASE_PATH}${bp_name}/manifest.json`)

			bp_data.dependencies = []

			await writeJSON(
				`${BASE_PATH}${bp_name}/manifest.json`,
				bp_data,
				true
			)
			setRP('/@NO-DEPENDENCY@/')
			EventBus.trigger('bridge:refreshExplorer', '/@NO-DEPENDENCY@/')
			lw.close()
		} catch (e) {
			lw.close()
			new InformationWindow(
				'Unable to unlink packs',
				`bridge. failed to unlink the resource pack from ${bp_name}. ${e.message}`
			)
		}
	}
}
