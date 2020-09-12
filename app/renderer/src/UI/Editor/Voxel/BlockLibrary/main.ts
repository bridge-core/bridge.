/**
 * TODO: Load Minecraft's blocks (and custom blocks inside of the current project) correctly
 */
import { createErrorNotification } from '../../../../AppCycle/Errors'

const library = new Map([
	['minecraft:air', 0],
	['bridge:invalid', 1],
	['minecraft:bedrock', 2],
	['minecraft:stone', 3],
	['minecraft:dirt', 4],
	['minecraft:grass', 5],
])

export const BlockLibrary = {
	/**
	 * Get the runtime ID for a string block ID
	 */
	getRuntimeID: (id: string) => {
		let numericalID = library.get(id)
		if (numericalID === undefined) {
			createErrorNotification(
				new Error(`Unknown block "${id}", returning "minecraft:air"`)
			)
			return 1
		}

		return numericalID
	},
}
