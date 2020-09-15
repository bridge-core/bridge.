/**
 * TODO: Load Minecraft's blocks (and custom blocks inside of the current project) correctly
 */
import { join } from 'path'
import { createErrorNotification } from '../../../../AppCycle/Errors'
import { readJSON } from '../../../../Utilities/JsonFS'
import { promises as fs } from 'fs'
import { isTransparentTexture, loadImage } from './texture'
declare const __static: string

const library: IBlockData[] = [
	{
		id: 'bridge:unknown_block',
		textureData: {
			all: {
				texturePath: join(
					__static,
					'vanilla/RP/textures/blocks/missing_tile'
				),
			},
		},
		faces: {},
	},
]

export type TDirection =
	| 'up'
	| 'down'
	| 'north'
	| 'west'
	| 'east'
	| 'south'
	| 'side'
	| 'all'

export interface IBlockData {
	id: string
	faces?: {
		[dir in TDirection]?: {
			isTransparent: boolean
			uvOffset: [number, number]
		}
	}
	textureData?: {
		[dir in TDirection]?: {
			texturePath: string
			overlayColor?: [number, number, number]
		}
	}
}

export async function createTileMap() {
	const canvas = document.createElement('canvas')
	const rowLength = Math.ceil(Math.sqrt(library.length * 8))
	canvas.width = rowLength * 16
	canvas.height = canvas.width
	const context = canvas.getContext('2d')
	context.imageSmoothingEnabled = false

	let currentUVOffset = 0
	for (const blockData of library) {
		for (const [dir, { texturePath, overlayColor }] of Object.entries(
			blockData.textureData
		)) {
			const x = currentUVOffset % rowLength
			const y = Math.floor(currentUVOffset / rowLength)
			context.drawImage(
				await loadImage(texturePath, overlayColor),
				x * 16,
				y * 16,
				16,
				16
			)

			blockData.faces[dir as TDirection] = {
				isTransparent: isTransparentTexture(context, x * 16, y * 16),
				uvOffset: [x, y],
			}
			currentUVOffset++
		}
	}

	await fs.writeFile(
		join(__static, 'assets/dynamic.png'),
		canvas
			.toDataURL('image/png')
			.split(';base64,')
			.pop(),
		{ encoding: 'base64' }
	)

	console.log(library, BlockLibrary)
	return canvas
}

export async function loadVanillaBlocks() {
	const { texture_data } = await readJSON(
		join(__static, 'vanilla/RP/textures/terrain_texture.json')
	)
	const blockDefs = await readJSON(join(__static, 'vanilla/RP/blocks.json'))
	const resolveTextures = (textures: unknown) => {
		if (textures === undefined)
			return {
				all: {
					texturePath: join(
						__static,
						'vanilla/RP/textures/blocks/missing_tile'
					),
				},
			}

		if (typeof textures === 'string') return { all: loadFromMap(textures) }

		return Object.fromEntries(
			Object.entries(textures).map(([dir, texture]) => [
				dir,
				loadFromMap(texture),
			])
		)
	}
	const loadFromMap = (texture: string) => {
		let data = texture_data[texture].textures
		let overlayColor

		if (Array.isArray(data)) data = data[0]
		if (typeof data !== 'string') {
			overlayColor = data.overlay_color
			overlayColor = [
				overlayColor.slice(1, 3),
				overlayColor.slice(3, 5),
				overlayColor.slice(5, 7),
			].map(c => new Number(`0x${c}`))
			data = data.path
		}

		return { texturePath: join(__static, 'vanilla/RP', data), overlayColor }
	}

	Object.entries(blockDefs).forEach(([id, data]) => {
		if (id === 'air') return

		BlockLibrary.addBlock({
			id: `minecraft:${id}`,
			textureData: resolveTextures(
				(data as any).carried_textures || (data as any).textures
			) as any,
			faces: {},
		})
	})
}

loadVanillaBlocks()
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
	getDisplayTexture: (id: number) => {
		const textureData = library[id - 1].textureData
		return (
			(
				(textureData as any)?.all ||
				(textureData as any)?.side ||
				(textureData as any)?.west
			).texturePath + '.png'
		)
	},

	isTransparent: (id: number, faces: TDirection[]) => {
		if (id === 0) return true
		if (BlockLibrary.isSlab(id) || BlockLibrary.isFence(id)) return true

		const faceData = library[id - 1].faces
		for (let face of faces) {
			if (faceData[face]?.isTransparent) return true
		}
		return false
	},
	getVoxelUV(id: number, faces: TDirection[]) {
		const faceData = library[id - 1].faces

		for (let face of faces) {
			if (faceData[face] !== undefined) return faceData[face].uvOffset
		}
		return library[0].faces.all.uvOffset
	},
	isSlab(id: number) {
		if (id === 0) return false

		return library[id - 1].id.includes('_slab')
	},
	isFence(id: number) {
		if (id === 0) return false

		return library[id - 1].id.includes('fence')
	},
}
