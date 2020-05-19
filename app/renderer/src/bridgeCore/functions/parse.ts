import {
	CommandRegistry,
	parseCommandArguments,
	UsedSelectors,
} from '../../plugins/CustomCommands'
import LightningCache from '../../editor/LightningCache'

export async function parseFunction(str: string, filePath: string) {
	const commands = new Set<string>()
	const lines = str.split('\n').map(l => {
		for (let [commandName, command] of CommandRegistry) {
			if (l[0] === '#') continue

			if (l.startsWith(`${commandName}`)) {
				commands.add(commandName)

				const [_, ...args] = splitCommand(l)
				const applyData = command.onApply(
					parseCommandArguments(args.filter(arg => arg !== ''))
				)
				return Array.isArray(applyData)
					? applyData.join('\n')
					: applyData
			}
		}

		const [command, ...args] = splitCommand(l)

		return `${command} ${parseCommandArguments(
			args.filter(arg => arg !== ''),
			false
		).join(' ')}`
	})

	await LightningCache.setPlainData(filePath, {
		custom_commands: Array.from(commands).concat(Array.from(UsedSelectors)),
	})
	UsedSelectors.clear()
	return lines.join('\n')
}

export function splitCommand(command: string) {
	let i = 0
	let lastSplit = 0
	let squareBracket = 0
	let res: string[] = []

	while (i < command.length) {
		const char = command[i++]
		if (char === '[') squareBracket++
		else if (char === ']') squareBracket--
		else if (char === ' ' && squareBracket === 0) {
			res.push(command.substring(lastSplit, i - 1))
			lastSplit = i
		}
	}

	res.push(command.substring(lastSplit, command.length))

	return res
}
