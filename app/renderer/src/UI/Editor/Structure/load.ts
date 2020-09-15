import { promises as fs } from 'fs'
import nbt from 'prismarine-nbt'
import { createErrorNotification } from '../../../AppCycle/Errors'
import { createNotification } from '../../Footer/create'
import { createInformationWindow } from '../../Windows/Common/CommonDefinitions'
import { BlockLibrary } from '../Voxel/BlockLibrary/main'
import { createVoxelEditor } from '../Voxel/create'

export async function loadStructure(
	filePath: string,
	canvas: HTMLCanvasElement
) {
	const rawStructure = await fs.readFile(filePath)
	const nbtStructure = nbt.parseUncompressed(rawStructure, true)
	const {
		format_version,
		size,
		structure,
		structure_world_origin,
	} = nbt.simplify(nbtStructure)
	const { entities, block_indices, palette } = structure
	const currentPalette = palette.default.block_palette

	//Warning notification - should be removed when this is fixed
	if (size[0] > 32 || size[2] > 32) {
		let structureWarning = createNotification({
			icon: 'mdi-alert-circle-outline',
			message: 'Warning',
			color: 'error',
			textColor: 'white',
			onClick: () => {
				structureWarning.dispose()
				createInformationWindow(
					'Warning',
					'There is currentlty a bug in minecraft where large structures can be cut off when generated with features and feature rules. The limit seems to be 32x32 on the x and z axis.'
				)
			},
		})
	}

	if (format_version !== 1)
		return createErrorNotification(
			new Error(`Unknown structure format version: ${format_version}`)
		)

	const editor = await createVoxelEditor(canvas, {
		chunkSize: Math.max(...(size as number[])),
		tileSize: 16,
		renderDistance: 12,
		limitedSize: true,
	})
	const world = editor.getWorld()
	console.log(currentPalette)

	const layer1 = block_indices[0]
	for (let i = 0; i < layer1.length; i++) {
		if (layer1[i] === -1) continue

		const blockData = currentPalette[layer1[i]]
		world.setVoxel(
			Math.floor(i / (size[2] * size[1])),
			Math.floor(i / size[2]) % size[1],
			i % size[2],
			BlockLibrary.getRuntimeID(blockData.name)
		)
	}
	return editor
}
