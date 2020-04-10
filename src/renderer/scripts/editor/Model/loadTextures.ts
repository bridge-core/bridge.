import FetchDefinitions from '../FetchDefinitions'
import { readJSON } from '../../Utilities/JsonFS'
import { Texture, MeshLambertMaterial } from 'three'

export interface ITextureData {
	texture: {
		name: string
		file_path: string
		data?: Texture
	}
	material?: MeshLambertMaterial
}

export async function loadAllTextures(identifiers: string[]) {
	let res: { [id: string]: ITextureData[] } = {}
	await Promise.all(
		identifiers.map(async id => (res[id] = await loadTextures(id)))
	)

	return res
}

export async function loadTextures(identifier: string) {
	//Get all files that use the model
	let files = await FetchDefinitions.fetchSingle(
		'client_entity',
		['geometry_identifiers'],
		identifier,
		true
	)

	//Load textures from the files
	let textures = await Promise.all(
		files.map(async f => {
			return (await readJSON(f).catch(() => ({})))[
				'minecraft:client_entity'
			]?.description?.textures as { [name: string]: string }
		})
	)

	//Change data format
	let data: ITextureData[] = []
	textures.forEach(texObj => {
		for (let [key, val] of Object.entries(texObj ?? {}))
			data.push({
				texture: {
					name: key,
					file_path: val.endsWith('.png') ? val : val + '.png',
				},
			})
	})

	return data.reduce(
		(unique: ITextureData[], curr) =>
			unique.find(
				({ texture: { file_path } }) =>
					file_path === curr.texture.file_path
			)
				? unique
				: unique.concat([curr]),
		[]
	)
}
