import { OnSaveData } from './main'
import { transformJsonCommands } from './functions/transformJson'
import { writeJSON } from '../Utilities/JsonFS'

export default async function AnimationHandler({
	data,
	file_uuid,
	file_path,
	simulated_call,
	file_version,
}: OnSaveData) {
	let animations = data['animations']
	if (!animations) return

	for (let id in animations) {
		for (let timestamp in animations[id].timeline) {
			let commands = animations[id].timeline[timestamp]
			if (Array.isArray(commands))
				commands = await transformJsonCommands(file_uuid, commands)
			else commands = await transformJsonCommands(file_uuid, [commands])

			animations[id].timeline[timestamp] = commands
		}
	}

	if (simulated_call) await writeJSON(file_path, data, true, file_version)
}
