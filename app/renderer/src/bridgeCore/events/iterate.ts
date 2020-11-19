import { createErrorNotification } from '../../AppCycle/Errors'
import { transformRunCommands } from '../functions/transformJson'

interface IEvent {
	run_command?: {
		command?: string | string[]
		target?: string
	}
	sequence?: IEvent[]
	randomize?: IEvent[]
}

export async function iterateEvents(
	fileUUID: string,
	fileName: string,
	events: Record<string, unknown>
) {
	for (const eventName in events) {
		await compileEvent(
			fileUUID,
			fileName,
			eventName,
			events[eventName] as IEvent
		)
	}
}

export async function compileEvent(
	fileUUID: string,
	fileName: string,
	eventName: string,
	event: IEvent
) {
	if (event.run_command !== undefined) {
		let { command } = event.run_command
		if (typeof command === 'string') command = [command]

		if (Array.isArray(command))
			event.run_command.command = await transformRunCommands(
				fileUUID,
				command
			)
		else
			createErrorNotification(
				new Error(
					`Invalid run_command>command type: Expected array, found ${typeof command}! (Path: ${fileName} - ${eventName})`
				)
			)
	}

	if (event.sequence !== undefined && Array.isArray(event.sequence)) {
		event.sequence.forEach((sequenceEntry, i) =>
			compileEvent(
				fileUUID,
				fileName,
				`${eventName}>sequence>${i}`,
				sequenceEntry
			)
		)
	} else if (event.sequence !== undefined) {
		createErrorNotification(
			new Error(
				`Invalid event>sequence type: Expected array, found ${typeof event.sequence}! (Path: ${fileName} - ${eventName})`
			)
		)
	}

	if (event.randomize !== undefined && Array.isArray(event.randomize)) {
		event.randomize.forEach((randomizeEntry, i) =>
			compileEvent(
				fileUUID,
				fileName,
				`${eventName}>randomize>${i}`,
				randomizeEntry
			)
		)
	} else if (event.randomize !== undefined) {
		createErrorNotification(
			new Error(
				`Invalid event>randomize type: Expected array, found ${typeof event.randomize}! (Path: ${fileName} - ${eventName})`
			)
		)
	}
}
