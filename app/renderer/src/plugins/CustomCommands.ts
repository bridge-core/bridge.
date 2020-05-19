import { promises as fs } from 'fs'
import { join } from 'path'
import { run } from '../editor/ScriptRunner/run'
import { detachMerge } from '../Utilities/mergeUtils'
import FetchDefinitions from '../editor/FetchDefinitions'
import { BridgeCore } from '../bridgeCore/main'
import OmegaCache from '../editor/OmegaCache'
import { toCorrectType } from '../editor/Json'
import Provider from '../autoCompletions/Provider'

type TSelectorTransform = (
	selector: string,
	selectorArg: string[]
) => [string, string[]]
export const CommandNames: string[] = []
export const CommandRegistry = new Map<string, BridgeCommand>()
export const SelectorRegistry = new Map<string, TSelectorTransform>()
const UpdateFiles = new Set<string>()

export interface BridgeCommandClass {
	command_name: string
	new (): BridgeCommand
}
export abstract class BridgeCommand {
	static command_name = 'bridge:demo_command'

	abstract onApply(data: unknown[]): string | string[]
	onPropose() {}
}

export async function loadCustomCommands(folderPath: string) {
	try {
		const data = await fs.readdir(folderPath, { withFileTypes: true })

		await Promise.all(
			data.map(async dirent => {
				if (dirent.isDirectory())
					return await loadCustomCommands(
						join(folderPath, dirent.name)
					)

				await registerCustomCommand(join(folderPath, dirent.name))
			})
		)
	} catch {}
}

export async function registerCustomCommand(
	filePath: string,
	fileContent?: string
) {
	if (fileContent === undefined)
		fileContent = (await fs.readFile(filePath)).toString('utf-8')
	if (fileContent === undefined) return

	const promises: Promise<unknown>[] = []

	run(
		fileContent,
		{
			register: (Command: BridgeCommandClass) => {
				CommandNames.push(Command.command_name)
				CommandRegistry.set(Command.command_name, new Command())

				//Update files with custom command
				const fileRefs = FetchDefinitions.fetchSingle(
					'function',
					['custom_commands'],
					Command.command_name
				).then(fileRefs =>
					fileRefs.forEach(filePath => UpdateFiles.add(filePath))
				)
				promises.push(fileRefs)
			},
			insertAutoCompletions(path: string, definition: unknown) {
				Provider.addPluginCompletion(path, definition)
			},
			registerSelector: (
				selectorKey: string,
				func: TSelectorTransform
			) => {
				if (typeof func !== 'function') return

				SelectorRegistry.set(`selector@${selectorKey}`, func)

				const fileRefs = FetchDefinitions.fetchSingle(
					'function',
					['custom_commands'],
					`selector@${selectorKey}`
				).then(fileRefs =>
					fileRefs.forEach(filePath => UpdateFiles.add(filePath))
				)
				promises.push(fileRefs)
			},
		},
		'file'
	)
	await Promise.all(promises)
}

export async function updateCommandFiles() {
	await Promise.all(
		Array.from(UpdateFiles).map(async file => {
			try {
				const { cache_content, file_version } = await OmegaCache.load(
					file
				)
				await fs.writeFile(
					file,
					`#bridge-file-version: #${file_version}\n${await BridgeCore.beforeTextSave(
						cache_content,
						file
					)}`
				)
			} catch {}
		})
	)
	UpdateFiles.clear()
}

export function proposeCustomCommands() {
	let res = {}

	CommandRegistry.forEach(command => {
		let propose_data = command.onPropose()
		if (typeof propose_data !== 'object') return
		res = detachMerge(res, propose_data)
	})

	return res
}

export function parseCommandArguments(
	args: string[],
	transformType = true
): string[] | unknown[] {
	return args.map(arg => {
		if (arg[0] === '@') return parseSelector(arg)
		return transformType ? toCorrectType(arg) : arg
	})
}

export const UsedSelectors = new Set<string>()
export function parseSelector(rawSelector: string) {
	let selector: string = ''
	let selectorArgs: string[] = []

	const splitIndex = rawSelector.indexOf('[')
	if (splitIndex === -1) {
		selector = rawSelector
	} else {
		selector = rawSelector.substring(0, splitIndex)
		selectorArgs = rawSelector
			.substring(splitIndex + 1, rawSelector.length - 1)
			.split(',')
			.map(arg => arg.trim())
	}

	for (let [selectorKey, parse] of SelectorRegistry) {
		const parseResult = parse(selector, selectorArgs)
		if (
			!Array.isArray(parseResult) ||
			parseResult.length !== 2 ||
			!Array.isArray(parseResult[1])
		)
			continue
		;[selector, selectorArgs] = parseResult
		UsedSelectors.add(selectorKey)
	}

	if (selectorArgs.length === 0) return selector
	return `${selector}[${selectorArgs.join(',')}]`
}
