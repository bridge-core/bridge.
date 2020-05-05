import {
	registerCustomCommand,
	updateCommandFiles,
} from '../../plugins/CustomCommands'

export async function updateCustomCommand(str: string, filePath: string) {
	console.log('UPDATE')
	await registerCustomCommand(filePath, str)
	await updateCommandFiles()
	return str
}
