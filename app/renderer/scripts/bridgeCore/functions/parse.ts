import { CommandRegistry } from '../../plugins/CustomCommands'
import { toCorrectType } from '../../editor/Json'
import LightningCache from '../../editor/LightningCache'

export async function parseFunction(str: string, filePath: string) {
	const commands: string[] = []
	const lines = str.split('\n').map(l => {
		for (let [commandName, command] of CommandRegistry) {
			if (l.startsWith(`${commandName}`)) {
				commands.push(commandName)

				const [_, ...args] = l.split(' ')
				const applyData = command.onApply(
					args
						.filter(arg => arg !== '')
						.map(arg => toCorrectType(arg))
				)
				return Array.isArray(applyData)
					? applyData.join('\n')
					: applyData
			}
		}

		return l
	})

	await LightningCache.setPlainData(filePath, { custom_commands: commands })
	return lines.join('\n')
}
