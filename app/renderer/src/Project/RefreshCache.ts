import { CURRENT } from '../constants'
import FileSystem from '../FileSystem'
import JSONTree from '../editor/JsonTree'
import LightningCache from '../editor/LightningCache'
import ComponentRegistry from '../plugins/CustomComponents'
import { trySetRP } from '../Utilities/FindRP'
import { BridgeCore } from '../bridgeCore/main'
import FileType from '../editor/FileType'

export async function refreshCache(refresh_rp = false, reset = true) {
	if (!CURRENT.RPFileExplorer) await trySetRP() //Try loading the RP if it's not loaded yet

	let explorer = refresh_rp ? CURRENT.RPFileExplorer : CURRENT.BPFileExplorer
	if (explorer === undefined) return

	await explorer.loading_promise
	let files = explorer.getAllFiles()
	if (reset) LightningCache.init()

	for (let filePath of files) {
		const fileType = FileType.get(filePath)
		if (fileType === 'unknown') continue

		const fileContent = await FileSystem.loadFileAsTree(filePath)

		if (fileContent instanceof JSONTree) {
			if (fileType === 'entity')
				await ComponentRegistry.parse(
					filePath,
					fileContent.toJSON(),
					false
				)
			else if (fileType === 'block')
				await ComponentRegistry.parseBlock(
					filePath,
					fileContent.toJSON(),
					false
				)
			await LightningCache.add(filePath, fileContent, false)
		} else {
			if (fileType === 'function')
				await BridgeCore.beforeTextSave(fileContent, filePath)
		}
	}

	await LightningCache.saveCache()
}
