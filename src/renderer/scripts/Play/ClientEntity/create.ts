import { readJSON } from '../../Utilities/JsonFS'
import { IClientEntity } from './Format'
import FetchDefinitions from '../../editor/FetchDefinitions'
import { getModelId } from '../Model/getModelId'

export async function createClientEntity(filePath: string) {
	let {
		'minecraft:client_entity': {
			description: { animations, textures, geometry } = {},
		} = {},
	} = (await readJSON(filePath)) as IClientEntity

	const geometryMap = new Map(
		await Promise.all(
			Object.entries(geometry ?? {}).map(async ([name, id]) => {
				let [modelFile] = await FetchDefinitions.fetchSingle(
					'entity_model',
					['identifiers'],
					id,
					false
				)
				console.log(modelFile)

				return [
					name,
					getModelId(await readJSON(modelFile), id),
				] as const
			})
		)
	)
	console.log(geometryMap)
}
