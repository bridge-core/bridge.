import { OnSaveData } from './main'
import { transformJsonCommands } from './functions/transformJson'
import { writeJSON } from '../Utilities/JsonFS'

export default async function AnimationControllerHandler({
	data,
	file_uuid,
	file_path,
	simulated_call,
	file_version,
}: OnSaveData) {
	let animationControllers = data['animation_controllers']
	if (!animationControllers) return

	for (let id in animationControllers) {
		for (let stateName in animationControllers[id].states) {
			//ON ENTRY
			let entryCommands =
				animationControllers[id].states[stateName].on_entry ?? []

			if (Array.isArray(entryCommands))
				entryCommands = await transformJsonCommands(
					file_uuid,
					entryCommands
				)
			else
				entryCommands = await transformJsonCommands(file_uuid, [
					entryCommands,
				])

			if (entryCommands.length > 0)
				animationControllers[id].states[
					stateName
				].on_entry = entryCommands

			//ON EXIT
			let exitCommands =
				animationControllers[id].states[stateName].on_exit ?? []

			if (Array.isArray(exitCommands))
				exitCommands = await transformJsonCommands(
					file_uuid,
					exitCommands
				)
			else
				exitCommands = await transformJsonCommands(file_uuid, [
					exitCommands,
				])

			if (exitCommands.length > 0)
				animationControllers[id].states[
					stateName
				].on_exit = exitCommands
		}
	}

	if (simulated_call) await writeJSON(file_path, data, true, file_version)
}
