import {
	CommandRegistry,
	parseCommandArguments,
	UsedSelectors,
	parseSelector,
} from '../../plugins/CustomCommands'
import LightningCache from '../../editor/LightningCache'
import { setFunctionCache, CacheTests, FunctionCache } from './cache'

export async function parseFunction(str: string, filePath: string) {
	const [usedCommands, lines] = parseCommands(str)

	await LightningCache.setPlainData(filePath, {
		custom_commands: Array.from(usedCommands).concat(
			Array.from(UsedSelectors)
		),
		...Object.fromEntries(
			Array.from(FunctionCache.entries()).map(([id, set]) => [
				id,
				Array.from(set),
			])
		),
	})
	UsedSelectors.clear()
	FunctionCache.clear()
	return lines.join('\n')
}

export function parseCommands(commands: string): [Set<string>, string[]] {
	let usedCommands = new Set<string>()

	return <[Set<string>, string[]]>[
		usedCommands,
		commands
			.split('\n')
			.map(l => {
				if (l[0] === '#') return l
				l = l.trim()

				//Handle execute command executing custom commands
				if (l.startsWith('execute ')) {
					const commandArr = splitCommand(l)
					if (commandArr.length > 6) {
						const [
							execute,
							selector,
							loc1,
							loc2,
							loc3,
							...command
						] = commandArr

						//Parse nested command
						const [tmpUsedCommands, parsedCommands] = parseCommands(
							command.join(' ')
						)

						//Update usedCommands reference
						usedCommands = new Set([
							...usedCommands,
							...tmpUsedCommands,
						])

						//Prefix parsedCommands with execute command
						return parsedCommands.map(
							(command: string) =>
								`execute ${parseSelector(
									selector
								)} ${loc1} ${loc2} ${loc3} ${command}`
						)
					}
				}

				for (let [commandName, command] of CommandRegistry) {
					if (l.startsWith(`${commandName}`)) {
						usedCommands.add(commandName)

						const [_, ...args] = splitCommand(l)

						const commandArgs = parseCommandArguments(
							args.filter(arg => arg !== '')
						)

						command
							.onCacheHook?.(commandArgs)
							?.filter(arr => arr && arr[0] && arr[1])
							?.forEach(([id, data]: [string, string[]]) => {
								// Validate that data has the correct structure
								if (!data || !data[0]) return

								//Populate cache with data
								if (FunctionCache.has(id)) {
									;(Array.isArray(data)
										? data
										: [data]
									).forEach(entry =>
										FunctionCache.get(id).add(entry)
									)
								} else {
									FunctionCache.set(
										id,
										Array.isArray(data)
											? new Set(data as string[])
											: new Set([data])
									)
								}
							})

						return command.onApply(commandArgs)
					}
				}

				//Only executes if command is not a registered custom command
				const [command, ...args] = splitCommand(l)

				//Save scoreboard & tag names
				setFunctionCache(l, CacheTests)

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
	let isInQuotes = false
	let isInSingleQuotes = false
	let res: string[] = []

	while (i < command.length) {
		const char = command[i++]
		if (char === '[') squareBracket++
		else if (char === ']') squareBracket--
		else if (char === '"' && !isInSingleQuotes) isInQuotes = !isInQuotes
		else if (char === "'" && !isInQuotes)
			isInSingleQuotes = !isInSingleQuotes
		else if (
			char === ' ' &&
			squareBracket === 0 &&
			!isInQuotes &&
			!isInSingleQuotes
		) {
			res.push(command.substring(lastSplit, i - 1))
			lastSplit = i
		}
	}

	res.push(command.substring(lastSplit, command.length))

	return res
}
export function splitSelectorArgs(selectorArgs: string) {
	let i = 0
	let lastSplit = 0
	let curlyBracket = 0
	let res: string[] = []

	while (i < selectorArgs.length) {
		const char = selectorArgs[i++]
		if (char === '{') curlyBracket++
		else if (char === '}') curlyBracket--
		else if (char === ',' && curlyBracket === 0) {
			res.push(selectorArgs.substring(lastSplit, i - 1))
			lastSplit = i
		}
	}

	res.push(selectorArgs.substring(lastSplit, selectorArgs.length))

	return res
}
