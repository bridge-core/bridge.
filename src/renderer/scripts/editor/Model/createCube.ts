import { CubeFaces } from './CubeFaces'
import {
	BufferGeometry,
	BufferAttribute,
	Group,
	Mesh,
	Material,
	MathUtils,
} from 'three'
import { IUVObj } from './loadModel'

export function createCube(
	width: number,
	height: number,
	depth: number,
	startUV: [number, number] | IUVObj,
	[tW, tH]: [number, number],
	mirror: boolean
) {
	const usesUVObj = !Array.isArray(startUV)
	const positions: number[] = []
	const normals: number[] = []
	const uvs: number[] = []
	const indices: number[] = []
	let uvX: number = 0,
		uvY: number = 0
	if (!usesUVObj) [uvX, uvY] = startUV as [number, number]

	for (let {
		name,
		dir,
		corners,
		baseUV: [baseUVX, baseUVY],
	} of CubeFaces) {
		const ndx = positions.length / 3
		let uvSizeX, uvSizeY
		if (usesUVObj) {
			if ((startUV as IUVObj)[name] === undefined) continue
			;[uvX, uvY] = (startUV as IUVObj)[name]?.uv || []
			;[uvSizeX, uvSizeY] = (startUV as IUVObj)[name]?.uv_size || []
			baseUVX = 0
			baseUVY = 0
		}

		for (const {
			pos: [oX, oY, oZ],
			uv,
		} of corners) {
			positions.push((mirror ? -oX : oX) * width, oY * height, oZ * depth)
			normals.push(...dir)

			uvs.push(
				//Base offset of the current cube
				(uvX +
					//Horizontal offset for the current face
					(Number(baseUVX > 0) + Number(baseUVX > 2)) *
						Math.floor(uvSizeX ?? depth) +
					Number(baseUVX > 1) * Math.floor(uvSizeX ?? width) +
					//Face corner specific offsets
					uv[0] *
						(name === 'west' || name === 'east'
							? Math.floor(uvSizeX ?? depth)
							: Math.floor(uvSizeX ?? width))) /
					tW,
				//Align uv to top left corner
				1 -
					//Base offset of the current cube
					(uvY +
						//Vertical offset for the current face
						baseUVY * Math.floor(uvSizeY ?? depth) +
						(name === 'up' || name === 'down'
							? Math.floor(uvSizeY ?? depth)
							: Math.floor(uvSizeY ?? height)) -
						//Face corner specific offsets
						uv[1] *
							(name === 'up' || name === 'down'
								? Math.floor(uvSizeY ?? depth)
								: Math.floor(uvSizeY ?? height))) /
						tH
			)
		}

		indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3)
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
			origin: [number, number, number],
			pivot?: [number, number, number],
			rotation?: [number, number, number]
		) {
			let geo = createGeometry()
			let mesh = new Mesh(geo, material)

			if (rotation) {
				let group = new Group()

				if (pivot === undefined)
					pivot = [width / 2, height / 2, depth / 2]
				group.position.set(-pivot[0], pivot[1], pivot[2])
				mesh.position.set(
					-origin[0] - width / 2 + pivot[0],
					origin[1] - pivot[1],
					origin[2] - pivot[2]
				)
				group.add(mesh)

				const [rX, rY, rZ] = rotation
				console.log(rotation)
				group.name = `#cubePivot.${name}`
				group.rotation.set(
					MathUtils.degToRad(-rX),
					MathUtils.degToRad(-rY),
					MathUtils.degToRad(rZ)
				)

				return group
			}

			mesh.position.set(-origin[0] - width / 2, origin[1], origin[2])

			return mesh
		},
	}
}
