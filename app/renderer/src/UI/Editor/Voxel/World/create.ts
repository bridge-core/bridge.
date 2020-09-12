import {
	BufferGeometry,
	BufferAttribute,
	Mesh,
	Scene,
	Material,
	Vector3,
} from 'three'
import { VoxelNeighbours } from '../Neighbours'
import { createChunk, TChunk } from './createChunk'
import uuid from 'uuid/v4'

export interface IVoxelWorldCommonOptions {
	chunkSize: number
	renderDistance: number
	tileSize: number
	tileTextureWidth: number
	tileTextureHeight: number
}
export interface IVoxelWorldOptions extends IVoxelWorldCommonOptions {
	scene: Scene
	material: Material
}

export type TVoxelWorld = ReturnType<typeof createVoxelWorld>

/**
 * Create a new voxel world
 * @param VoxelWorldConfig Set properties of the voxel world
 */
export function createVoxelWorld({
	chunkSize,
	tileSize,
	tileTextureWidth,
	tileTextureHeight,
	scene,
	material,
	renderDistance,
}: IVoxelWorldOptions) {
	const chunks = new Map<string, TChunk>()
	const chunkCache = new Map<string, Mesh>()

	const getChunkID = (x: number, y: number, z: number) => {
		return `${Math.floor(x / chunkSize)},${Math.floor(
			y / chunkSize
		)},${Math.floor(z / chunkSize)}`
	}
	const getChunkCoordinates = (x: number, y: number, z: number) => {
		return [
			Math.floor(x / chunkSize),
			Math.floor(y / chunkSize),
			Math.floor(z / chunkSize),
		] as const
	}

	const addChunkForVoxel = (x: number, y: number, z: number) => {
		const chunkID = getChunkID(x, y, z)
		let chunk = chunks.get(chunkID)
		if (chunk === undefined) {
			chunk = createChunk(chunkSize, ...getChunkCoordinates(x, y, z))
			chunks.set(chunkID, chunk)
		}
		return chunk
	}
	const getChunk = (x: number, y: number, z: number): TChunk | undefined => {
		return chunks.get(getChunkID(x, y, z))
	}

	const setVoxel = (
		x: number,
		y: number,
		z: number,
		blockID: number,
		addChunk = true
	) => {
		let chunk
		if (addChunk) {
			chunk = addChunkForVoxel(x, y, z)
		} else {
			chunk = getChunk(x, y, z)
			if (chunk === undefined) return
		}

		chunk.setVoxel(x, y, z, blockID)
	}

	const getVoxel = (x: number, y: number, z: number) => {
		const chunk = getChunk(x, y, z)
		if (chunk === undefined) return 0

		return chunk.getVoxel(x, y, z)
	}

	const generateGeometryDataForChunk = (
		chunkX: number,
		chunkY: number,
		chunkZ: number
	) => {
		return chunks
			.get(
				getChunkID(
					chunkX * chunkSize,
					chunkY * chunkSize,
					chunkZ * chunkSize
				)
			)
			?.getGeometryData(tileSize, tileTextureWidth, tileTextureHeight, {
				getVoxel,
				getChunk,
			})
	}

	const updateChunkGeometry = async (x: number, y: number, z: number) => {
		const chunkX = Math.floor(x / chunkSize)
		const chunkY = Math.floor(y / chunkSize)
		const chunkZ = Math.floor(z / chunkSize)
		const chunkID = getChunkID(x, y, z)
		//Building chunks is expensive, skip it whenever possible
		if (!chunks.has(chunkID)) return

		let mesh = chunkCache.get(chunkID)
		const geometry = mesh
			? (mesh.geometry as BufferGeometry)
			: new BufferGeometry()

		const data = await generateGeometryDataForChunk(chunkX, chunkY, chunkZ)
		if (data === undefined) {
			if (mesh) {
				scene.remove(mesh)
				activeChunks.delete(chunkID)
				chunkCache.delete(chunkID)
			}
			return
		}
		const { positions, normals, uvs, indices } = data as any

		const positionNumComponents = 3
		geometry.setAttribute(
			'position',
			new BufferAttribute(
				new Float32Array(positions),
				positionNumComponents
			)
		)
		const normalNumComponents = 3
		geometry.setAttribute(
			'normal',
			new BufferAttribute(new Float32Array(normals), normalNumComponents)
		)
		const uvNumComponents = 2
		geometry.setAttribute(
			'uv',
			new BufferAttribute(new Float32Array(uvs), uvNumComponents)
		)
		geometry.setIndex(indices)
		geometry.computeBoundingSphere()

		if (mesh === undefined) {
			mesh = new Mesh(geometry, material)
			mesh.name = chunkID
			chunkCache.set(chunkID, mesh)
			activeChunks.add(chunkID)
			mesh.position.set(
				chunkX * chunkSize,
				chunkY * chunkSize,
				chunkZ * chunkSize
			)
			scene.add(mesh)
		}
	}

	const updateVoxelGeometry = (x: number, y: number, z: number) => {
		const updatedChunks = new Set<string>()
		for (const [oX, oY, oZ] of VoxelNeighbours) {
			const chunkID = getChunkID(x + oX, y + oY, z + oZ)
			if (!updatedChunks.has(chunkID)) {
				updatedChunks.add(chunkID)
				updateChunkGeometry(x + oX, y + oY, z + oZ)
			}
		}
	}

	const activeChunks = new Set<string>()
	const updateCurrentMeshes = async (x: number, y: number, z: number) => {
		Array.from(activeChunks).forEach(currID => {
			let mesh = chunkCache.get(currID)
			if (mesh !== undefined) scene.remove(mesh)
			activeChunks.delete(currID)
		})

		const max = (renderDistance * chunkSize) / 2
		const start = -max
		const promises: Promise<void>[] = []
		for (let oX = start; oX < max; oX += chunkSize)
			for (let oZ = start; oZ < max; oZ += chunkSize)
				for (let oY = start; oY < max; oY += chunkSize) {
					const chunkID = getChunkID(x + oX, y + oY, z + oZ)

					if (
						!activeChunks.has(chunkID) &&
						new Vector3(oX, oY, oZ).distanceTo(
							new Vector3(x, y, z)
						) <
							max * tileSize
					) {
						let mesh = chunkCache.get(chunkID)
						if (mesh === undefined) {
							promises.push(
								updateChunkGeometry(x + oX, y + oY, z + oZ)
							)
						} else {
							scene.add(mesh)
							activeChunks.add(chunkID)
						}
					}
				}

		await Promise.all(promises)
	}

	return {
		getVoxel,
		setVoxel,

		getChunk,

		updateVoxelGeometry,
		updateCurrentMeshes,
	}
}
