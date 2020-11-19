import { parseCommands } from './parse'
import { UsedSelectors } from '../../plugins/CustomCommands'
import { FunctionCache } from './cache'
import LightningCache from '../../editor/LightningCache'
import { once } from '../../AppCycle/EventSystem'

export async function transformRunCommands(
	fileUuid: string,
	commandArr: string[]
) {
	UsedSelectors.clear()
	FunctionCache.clear()
	const commandsStore = new Set<string>()
	const transformedCommands: string[] = []

	for (let command of commandArr) {
		const [usedCommands, commands] = parseCommands(command)
		usedCommands.forEach(command => commandsStore.add(command))

		transformedCommands.push(...commands)
	}

	await LightningCache.setPlainDataWithTypeAndKey(
		'function',
		fileUuid,
		Object.fromEntries(
			Array.from(FunctionCache.entries()).map(([id, set]) => [
				id,
				Array.from(set),
			])
		)
	)

	once('bridge:onCacheHook[json.custom_commands]', () =>
		Array.from(commandsStore).concat(Array.from(UsedSelectors))
	)
	UsedSelectors.clear()
	FunctionCache.clear()

	return transformedCommands
}

export async function transformJsonCommands(
	fileUuid: string,
	commandArr: string[]
) {
	UsedSelectors.clear()
	FunctionCache.clear()
	const commandsStore = new Set<string>()
	const transformedCommands: string[] = []

	for (let command of commandArr) {
		//This array entry is not a command (entity event or molang)
		if (command[0] !== '/') {
			transformedCommands.push(command)
			continue
		}

		const [usedCommands, commands] = parseCommands(
			command.substring(1, command.length)
		)
		usedCommands.forEach(command => commandsStore.add(command))

		transformedCommands.push(...commands.map(command => `/${command}`))
	}

	await LightningCache.setPlainDataWithTypeAndKey(
		'function',
		fileUuid,
		Object.fromEntries(
			Array.from(FunctionCache.entries()).map(([id, set]) => [
				id,
				Array.from(set),
			])
		)
	)

	once('bridge:onCacheHook[json.custom_commands]', () =>
		Array.from(commandsStore).concat(Array.from(UsedSelectors))
	)
	UsedSelectors.clear()
	FunctionCache.clear()

	return transformedCommands
}
