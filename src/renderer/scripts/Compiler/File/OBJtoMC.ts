import { promises as fs } from 'fs'
import { IBoneSchema, IModelSchema } from '../../editor/Model/loadModel'
import { promisify } from 'util'
const sizeOf = promisify(require('image-size'))

export async function OBJtoMC(
	filePath: string,
	texturePath: string,
	modelID: string
): Promise<IModelSchema> {
	type TVector = [number, number, number]

	let positions: TVector[] = []
	let normals: TVector[] = []
	let uvs: [number, number][] = []
	let polys:
		| [TVector, TVector, TVector][]
		| [TVector, TVector, TVector][] = []
	const bones: IBoneSchema[] = []

	const { width, height } = await sizeOf(texturePath)

	const strFile = (await fs.readFile(filePath)).toString('utf-8')
	strFile.split(/\r\n|\n/g).forEach(line => {
		const firstSpace = line.indexOf(' ')
		const defType = line.substring(0, firstSpace)
		const data = line.substring(firstSpace + 1, line.length)

		switch (defType) {
			case 'v':
				positions.push(
					data
						.split(' ')
						.map(
							(str, i) => (i === 0 ? -5 : 5) * Number(str)
						) as TVector
				)
				break
			case 'vn':
				normals.push(
					data
						.split(' ')
						.map(
							(str, i) => (i === 0 ? -1 : 1) * Number(str)
						) as TVector
				)
				break
			case 'vt':
				const uv = data
					.split(' ')
					.map((str, i) => Number(str)) as TVector
				uvs.push([uv[0], uv[1]])
				break
			case 'f':
				const face = data.split(' ').map(index => {
					const v = Number(index.split('/')[0])
					const vt =
						index.includes('/') && !index.includes('//')
							? Number(index.split('/')[1])
							: Number(index.split('/')[0])
					const vn = index.includes('//')
						? Number(index.split('//')[1])
						: Number(
								index.split('/').length === 3
									? index.split('/')[2]
									: index.split('/')[0]
						  )
					return [v - 1, vn - 1, vt - 1] as const
				})
				//Minecraft currently doesn't support triangular shapes
				if (face.length === 3) face.push(face[0])
				polys.push(face as [TVector, TVector, TVector])

				break
			// TODO: SUPPORT FOR MULTIPLE BONES
			// case 'o':
			// 	bones.push({
			// 		name: data,
			// 		poly_mesh: {
			// 			normalized_uvs: true,
			// 			positions,
			// 			normals,
			// 			uvs,
			// 			polys,
			// 		},
			// 	})
			// 	polys = []
			// 	break
		}
	})

	if (polys.length > 0) {
		bones.push({
			name: 'body',
			poly_mesh: {
				normalized_uvs: true,
				positions,
				normals,
				uvs,
				polys,
			},
		})
	}

	return {
		format_version: '1.12.0',
		'minecraft:geometry': [
			{
				description: {
					identifier: modelID,
					texture_width: width,
					texture_height: height,
				},
				bones,
			},
		],
	}
}
