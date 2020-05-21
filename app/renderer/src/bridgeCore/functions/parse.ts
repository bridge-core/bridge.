import {
	CommandRegistry,
	parseCommandArguments,
	UsedSelectors,
} from '../../plugins/CustomCommands'
import LightningCache from '../../editor/LightningCache'

export async function parseFunction(str: string, filePath: string) {
	const [commands, lines] = parseCommands(str)

	await LightningCache.setPlainData(filePath, {
		custom_commands: Array.from(commands).concat(Array.from(UsedSelectors)),
	})
	UsedSelectors.clear()
	return lines.join('\n')
}

export function parseCommands(commands: string) {
	const usedCommands = new Set<string>()

	return <[Set<string>, string[]]>[
		usedCommands,
		commands
			.split('\n')
			.map(l => {
				for (let [commandName, command] of CommandRegistry) {
					if (l[0] === '#') continue

					if (l.startsWith(`${commandName}`)) {
						usedCommands.add(commandName)

						const [_, ...args] = splitCommand(l)
						return command.onApply(
							parseCommandArguments(
								args.filter(arg => arg !== '')
							)
						)
					}
				}

				const [command, ...args] = splitCommand(l)

				return `${command} ${parseCommandArguments(
					args.filter(arg => arg !== ''),
					false
				).join(' ')}`
			})
			.flat(Infinity),
	]
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
