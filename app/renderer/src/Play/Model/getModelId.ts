import {
	IModelSchema,
	IOldModelSchema,
	IOldGeoSchema,
} from '../../editor/Model/loadModel'

export function getModelId(data: IModelSchema | IOldModelSchema, id: string) {
	if (data.format_version === '1.12.0')
		return data['minecraft:geometry'].find(
			({ description: { identifier } }) => identifier === id
		)
	else return data[id] as IOldGeoSchema
}
