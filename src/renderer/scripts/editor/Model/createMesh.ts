import { CubeFaces } from './CubeFaces'
import {
	BufferGeometry,
	BufferAttribute,
	Group,
	Mesh,
	Material,
	MathUtils,
} from 'three'
import { IUVObj, IPolyMesh } from './loadModel'

export function createPolyMesh(
	{
		normalized_uvs,
		positions: mPositions,
		normals: mNormals,
		uvs: mUvs,
		polys,
	}: IPolyMesh,
	{
		texture_width,
		texture_height,
	}: { texture_width: number; texture_height: number }
) {
	if (!Array.isArray(polys)) throw new Error('Format not supported yet!')
	if (!normalized_uvs)
		mUvs = mUvs.map(([uvX, uvY]) => [
			uvX / texture_width,
			uvY / texture_height,
		])

	const positions: number[] = []
	const normals: number[] = []
	const uvs: number[] = []
	const indices: number[] = []

	let i = 0
	for (const face of polys) {
		for (const [vertexIndex, normalIndex, uvIndex] of face) {
			positions.push(...mPositions[vertexIndex])
			normals.push(...mNormals[normalIndex])
			uvs.push(...mUvs[uvIndex])
		}

		if (face.length === 3) {
			indices.push(i, i + 1, i + 2)
		} else {
			indices.push(i, i + 1, i + 2, i + 2, i, i + 3)
		}

		i += face.length
	}

	const createGeometry = () => {
		let geo = new BufferGeometry()
		geo.setAttribute(
			'position',
			new BufferAttribute(new Float32Array(positions), 3)
		)
		geo.setAttribute(
			'normal',
			new BufferAttribute(new Float32Array(normals), 3)
		)
		geo.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
		geo.setIndex(indices)

		return geo
	}

	return {
		createGeometry,
		createMesh(
			material: Material,
			pivot?: [number, number, number],
			rotation?: [number, number, number],
			inflate = 0
		) {
			// const calculatedWidth = inflate * 2 + width
			let geo = createGeometry()
			let mesh = new Mesh(geo, material)

			let group = new Group()
			group.rotation.order = 'ZYX'

			// if (pivot === undefined)
			// 	//Rotate around center of cube without pivot
			// 	pivot = [calculatedWidth / 2, height / 2, depth / 2]

			group.add(mesh)

			// if (rotation) {
			// 	group.position.set(-pivot[0], pivot[1], pivot[2])
			// 	mesh.position.set(
			// 		-origin[0] - calculatedWidth / 2 + pivot[0] + inflate,
			// 		origin[1] - pivot[1] - inflate,
			// 		origin[2] - pivot[2] - inflate
			// 	)

			// 	const [rX, rY, rZ] = rotation
			// 	group.name = `#cubePivot.${name}`
			// 	group.rotation.set(
			// 		MathUtils.degToRad(-rX),
			// 		MathUtils.degToRad(-rY),
			// 		MathUtils.degToRad(rZ)
			// 	)
			// } else {
			// 	group.position.set(
			// 		-origin[0] - calculatedWidth / 2 + inflate,
			// 		origin[1] - inflate,
			// 		origin[2] - inflate
			// 	)
			// }

			// if (inflate)
			// 	group.scale.set(
			// 		1 + inflate / (width / 2),
			// 		1 + inflate / (height / 2),
			// 		1 + inflate / (depth / 2)
			// 	)

			return group
		},
	}
}
