/**
 * TODO: Load Minecraft's blocks (and custom blocks inside of the current project) correctly
 */
import { join } from 'path'
import { createErrorNotification } from '../../../../AppCycle/Errors'
import { readJSON } from '../../../../Utilities/JsonFS'
declare const __static: string

const library: IBlockData[] = [
	{
		id: 'bridge:unknown_block',
		textureData: join(
			__static,
			'vanilla/RP/textures/blocks/missing_tile.png'
		),
	},
]

export interface IBlockData {
	id: string
	textureData?:
		| {
				top: string
				bottom: string
				north: string
				west: string
				east: string
				south: string
				side: string
		  }
		| string
}

export async function createTileMap() {
	const canvas = document.createElement('canvas')
	canvas.width = library.length * 16
	canvas.height = 3 * 16
	const context = canvas.getContext('2d')
	context.imageSmoothingEnabled = false

	await Promise.all(
		library.map(
			({ textureData }, i) =>
				new Promise((resolve, reject) => {
					const img = new Image()
					img.src =
						(textureData as any)?.side ||
						(textureData as any)?.west ||
						textureData
					img.addEventListener('load', () => {
						document.body.appendChild(img)
						context.drawImage(img, i * 16, 0)
						context.drawImage(img, i * 16, 16)
						context.drawImage(img, i * 16, 32)
						resolve()
					})
					img.addEventListener('error', reject)
				})
		)
	).catch(console.error)

	document.body.appendChild(canvas)
	return canvas
}

export async function loadVanillaBlocks() {
	const { texture_data } = await readJSON(
		join(__static, 'vanilla/RP/textures/terrain_texture.json')
	)
	const blockDefs = await readJSON(join(__static, 'vanilla/RP/blocks.json'))
	const resolveTextures = (textures: unknown) => {
		if (textures === undefined)
			return join(__static, 'vanilla/RP/textures/blocks/missing_tile.png')

		if (typeof textures === 'string') return loadFromMap(textures)

		return Object.fromEntries(
			Object.entries(textures).map(([dir, texture]) => [
				dir,
				loadFromMap(texture),
			])
		)
	}
	const loadFromMap = (texture: string) => {
		let data = texture_data[texture].textures

		if (Array.isArray(data)) data = data[0]
		if (typeof data !== 'string') data = data.path

		return join(__static, 'vanilla/RP', data + '.png')
	}

	Object.entries(blockDefs).forEach(([id, data]) => {
		BlockLibrary.addBlock({
			id: `minecraft:${id}`,
			textureData: resolveTextures((data as any).textures) as any,
		})
	})
}

loadVanillaBlocks().then(() => console.log(library))
export const BlockLibrary = {
	/**
	 * Get the runtime ID for a string block ID
	 */
	getRuntimeID: (id: string) => {
		if (id === 'minecraft:air') return 0

		let numericalID = library.findIndex(
			({ id: currentId }) => currentId === id
		)
		if (numericalID === -1) {
			createErrorNotification(
				new Error(`Unknown block "${id}", returning "minecraft:air"`)
			)
			return 1
		}

		return numericalID + 1
	},
	addBlock: (data: IBlockData) => {
		let numericalID = library.findIndex(
			({ id: currentId }) => currentId === data.id
		)
		if (numericalID !== -1) library[numericalID] = data
		else library.push(data)
	},
	getTileMapDimensions: () => ({
		tileTextureWidth: library.length * 16,
		tileTextureHeight: 3 * 16,
	}),
}
