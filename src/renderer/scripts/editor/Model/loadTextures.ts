import FetchDefinitions from '../FetchDefinitions'
import { readJSON } from '../../Utilities/JsonFS'
import { Texture } from 'three'

export async function loadTextures(identifiers: string[]) {
	//Get all files that use the different models
	let files = (
		await Promise.all(
			identifiers.map(id =>
				FetchDefinitions.fetchSingle(
					'client_entity',
					['geometry_identifiers'],
					id,
					true
				)
			)
		)
	).flat()

	//Load textures from the files
	let textures = await Promise.all(
		files.map(async f => {
			return (await readJSON(f))['minecraft:client_entity']?.description
				?.textures as { [name: string]: string }
		})
	)

	//Change data format
	let data: { name: string; file_path: string; texture?: Texture }[] = []
	textures.forEach(texObj => {
		for (let [key, val] of Object.entries(texObj ?? {}))
			data.push({
				name: key,
				file_path: val.endsWith('.png') ? val : val + '.png',
			})
	})

	return data.reduce(
		(unique, curr) =>
			unique.find(({ file_path }) => file_path === curr.file_path)
				? unique
				: unique.concat([curr]),
		[]
	)
}
