import {
	registerCustomCommand,
	updateCommandFiles,
} from '../../plugins/CustomCommands'

export async function updateCustomCommand(str: string, filePath: string) {
	await registerCustomCommand(filePath, str)
	await updateCommandFiles()
	return str
}
