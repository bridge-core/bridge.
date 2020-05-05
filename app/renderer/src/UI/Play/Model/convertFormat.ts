import {
	IOldModelSchema,
	IGeoSchema,
	IModelSchema,
} from '../../../editor/Model/loadModel'

export function toNewModelFormat(
	models: IOldModelSchema | IModelSchema
): IModelSchema {
	if (models.format_version === '1.12.0') return models

	let convertedModels: IGeoSchema[] = []
	for (let [identifier, data] of Object.entries(models)) {
		if (typeof data === 'string') continue
		const { bones, texturewidth, textureheight } = data

		convertedModels.push({
			description: {
				identifier,
				texture_width: texturewidth,
				texture_height: textureheight,
			},
			bones,
		})
	}

	return {
		format_version: '1.12.0',
		'minecraft:geometry': convertedModels,
	}
}
