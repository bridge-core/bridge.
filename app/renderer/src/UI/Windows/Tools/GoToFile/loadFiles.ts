import { FileExplorerStorage } from '../../../Sidebar/FileExplorer'
import { CURRENT, BP_BASE_PATH, RP_BASE_PATH } from '../../../../constants'
import path from 'path'

export function loadFiles(): { text: string; value: string }[] {
	const BP = FileExplorerStorage.get('explorer', CURRENT.PROJECT)
		.getAllFiles()
		.map(p => ({
			text: path.relative(BP_BASE_PATH, p).replace(/\\/g, '/'),
			value: p,
		}))
	//Resource Pack may be undefined
	const RP = FileExplorerStorage.get('resource_pack', CURRENT.RESOURCE_PACK)
		?.getAllFiles()
		?.map((p: string) => ({
			text: path.relative(RP_BASE_PATH, p).replace(/\\/g, '/'),
			value: p,
		}))
	return BP.concat(RP || [])
}
