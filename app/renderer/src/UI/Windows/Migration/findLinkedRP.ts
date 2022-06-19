import { join } from 'path'
import { RP_BASE_PATH } from '../../../constants'
import { readJSON } from '../../../Utilities/JsonFS'
import { promises as fs } from 'fs'
import { MinecraftManifest } from '../../../Project/Manifest/types'

/**
 * Find the linked resource pack for a given list of behavior pack dependencies.
 * @returns The path to to the resopurce pack or undefined if non exists
 */
export async function findRP(uuids: string[]) {
	try {
		const resourcePacks = await fs.readdir(RP_BASE_PATH)
		for (const pack of resourcePacks) {
			const manifest: MinecraftManifest.IStructure = await readJSON(
				join(RP_BASE_PATH, pack, 'manifest.json')
			)
			if (manifest.header.uuid && uuids.includes(manifest.header.uuid))
				return pack
		}
	} catch {
		return
	}
}
