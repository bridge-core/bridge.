import { VoxelFaces } from '../VoxelFaces'
import { VoxelNeighbours } from '../Neighbours'
import { BlockLibrary, TDirection } from '../BlockLibrary/main'

export type TChunk = ReturnType<typeof createChunk>

export function createChunk(
	chunkSize: number,
	chunkX: number,
	chunkY: number,
	chunkZ: number
) {
	const chunkData = new Uint32Array(chunkSize * chunkSize * chunkSize)
	const chunkSliceSize = chunkSize * chunkSize
	let blocksPlaced = 0
	let maxX = 0,
		maxY = 0,
		maxZ = 0
	let minX = chunkSize - 1,
		minY = chunkSize - 1,
		minZ = chunkSize - 1

	const isChunkSolid = () => blocksPlaced === chunkData.length
	const isChunkEmpty = () => blocksPlaced === 0

	const getVoxelOffset = (
		x: number,
		y: number,
		z: number,
		setBounds = false
	) => {
		const relX = Math.abs(Math.floor(x) % chunkSize)
		const relY = Math.abs(Math.floor(y) % chunkSize)
		const relZ = Math.abs(Math.floor(z) % chunkSize)

		if (setBounds) {
			// console.log(relX, relY, relZ)
			if (maxX < relX) maxX = relX
			if (maxY < relY) maxY = relY
			if (maxZ < relZ) maxZ = relZ

			if (minX > relX) minX = relX
			if (minY > relY) minY = relY
			if (minZ > relZ) minZ = relZ
		}

		return relY * chunkSliceSize + relZ * chunkSize + relX
	}

	const getVoxel = (x: number, y: number, z: number) => {
		return chunkData[getVoxelOffset(x, y, z)]
	}

	const setVoxel = async (
		x: number,
		y: number,
		z: number,
		blockID: number
	) => {
		let index = getVoxelOffset(x, y, z, true)

		let currID = chunkData[index]
		if (currID === 0 && blockID !== 0) {
			blocksPlaced++
		} else if (currID !== 0 && blockID === 0) {
			blocksPlaced--
		}

		chunkData[index] = blockID
	}

	const getSolidChunkGeometry = async (
		tileSize: number,
		tileTextureWidth: number,
		tileTextureHeight: number,
		{
			getVoxel: globalGetVoxel,
			getChunk,
		}: {
			getVoxel: typeof getVoxel
			getChunk: (x: number, y: number, z: number) => unknown
		}
	) => {
		const positions: number[] = []
		const normals: number[] = []
		const uvs: number[] = []
		const indices: number[] = []
		const startX = chunkX * chunkSize
		const startY = chunkY * chunkSize
		const startZ = chunkZ * chunkSize

		const renderNeighbours: [number, number, number][] = []
		for (let [oX, oY, oZ] of VoxelNeighbours)
			if (
				!(getChunk(
					chunkX + oX,
					chunkY + oY,
					chunkZ + oZ
				) as TChunk)?.isChunkSolid()
			)
				renderNeighbours.push([oX, oY, oZ])

		if (renderNeighbours.length === 0) return

		//TODO: Render solid chunks, only borders

		// return {
		// 	positions,
		// 	normals,
		// 	uvs,
		// 	indices,
		// }
	}

	/**
	 * TODO:
	 * This function is currently the big bottleneck of rendering worlds, needs optimizations
	 */
	const getGeometryData = async (
		tileSize: number,
		tileTextureWidth: number,
		tileTextureHeight: number,
		{
			getVoxel: globalGetVoxel,
			getChunk,
		}: {
			getVoxel: typeof getVoxel
			getChunk: (x: number, y: number, z: number) => unknown
		}
	) => {
		if (isChunkEmpty()) return
		// if (isChunkSolid())
		// 	return await getSolidChunkGeometry(
		// 		tileSize,
		// 		tileTextureWidth,
		// 		tileTextureHeight,
		// 		{
		// 			getVoxel: globalGetVoxel,
		// 			getChunk,
		// 		}
		// 	)

		const positions: number[] = []
		const normals: number[] = []
		const uvs: number[] = []
		const indices: number[] = []
		const startX = chunkX * chunkSize
		const startY = chunkY * chunkSize
		const startZ = chunkZ * chunkSize

		for (let y = minY; y <= maxY; y++) {
			for (let z = minZ; z <= maxZ; z++) {
				for (let x = minX; x <= maxX; x++) {
					const voxel = getVoxel(x, y, z)

					// The current voxel is not air, we may need to render faces for it
					if (voxel !== 0) {
						x = chunkX < 0 ? chunkSize - x : x
						y = chunkY < 0 ? chunkSize - y : y
						z = chunkZ < 0 ? chunkSize - z : z

						// Do we need faces for the current voxel?
						for (const { dir, corners, faces } of VoxelFaces) {
							const neighbour = globalGetVoxel(
								startX + x + dir[0],
								startY + y + dir[1],
								startZ + z + dir[2]
							)

							// This voxel has a transparent voxel as a neighbour in the current direction -> add face
							if (
								BlockLibrary.isTransparent(
									neighbour,
									(faces as unknown) as TDirection[]
								) ||
								BlockLibrary.isSlab(voxel) ||
								BlockLibrary.isFence(voxel) ||
								BlockLibrary.isStairs(voxel)
							) {
								const ndx = positions.length / 3
								for (let {
									pos: [oX, oY, oZ],
									uv: [uvX, uvY],
								} of corners) {
									const [
										voxelUVX,
										voxelUVY,
									] = BlockLibrary.getVoxelUV(
										voxel,
										(faces as unknown) as TDirection[]
									)
									if (BlockLibrary.isSlab(voxel)) {
										oY /= 2
										uvY /= 2
									} else if (BlockLibrary.isStairs(voxel)) {
										oY /= 2
										oX /= 2
										uvY /= 2
										uvX /= 2
									} else if (BlockLibrary.isFence(voxel)) {
										;(oX as number) =
											oX === 0 ? 6 / 16 : 10 / 16
										;(oZ as number) =
											oZ === 0 ? 6 / 16 : 10 / 16
										;(uvX as number) =
											uvX === 0 ? 6 / 16 : 10 / 16

										if (
											((faces as unknown) as TDirection[]).includes(
												'up'
											) ||
											((faces as unknown) as TDirection[]).includes(
												'down'
											)
										)
											(uvY as number) =
												uvY === 0 ? 6 / 16 : 10 / 16
									}

									positions.push(oX + x, oY + y, oZ + z)
									normals.push(...dir)
									uvs.push(
										((voxelUVX + uvX) * tileSize) /
											tileTextureWidth,
										1 -
											((voxelUVY + 1 - uvY) * tileSize) /
												tileTextureHeight
									)
								}
								indices.push(
									ndx,
									ndx + 1,
									ndx + 2,
									ndx + 2,
									ndx + 1,
									ndx + 3
								)
							}
						}
					}
				}
			}
		}

		return {
			positions,
			normals,
			uvs,
			indices,
		}
	}

	return {
		setVoxel,
		getVoxel,
		getGeometryData,
		isChunkSolid,
	}
}
