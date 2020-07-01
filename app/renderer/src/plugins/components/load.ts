import { promises as fs } from 'fs'
import { createErrorNotification } from '../../AppCycle/Errors'
import ComponentRegistry from '../CustomComponents'
import InformationWindow from '../../UI/Windows/Common/Information'
import { createLimitedEnv } from '../scripts/require'
import { run } from '../../editor/ScriptRunner/run'
import { extname } from 'path'

export async function loadJS(
	fileContent: string,
	promises: Promise<unknown>[] = []
) {
	try {
		await run(
			fileContent,
			[
				createLimitedEnv(),
				{
					register: (c: any) =>
						promises.push(ComponentRegistry.register(c)),
					report: (info: string) =>
						new InformationWindow('Information', info, false),
				},
			],
			{
				executionContext: 'file',
				envName: 'require, Bridge',
				async: true,
			}
		)
	} catch (err) {
		createErrorNotification(err)
	}
}

export function loadJSON(fileContent: string) {
	try {
		const {
			description: { identifier = undefined, ...description } = {},
			...entity
		} = JSON.parse(fileContent)['bridge:component']

		if (!identifier)
			return createErrorNotification(
				new Error('Custom component must include component name')
			)
		ComponentRegistry.register(
			class {
				static component_name = identifier

				onApply() {
					return {
						'minecraft:entity': {
							description,
							...entity,
						},
					}
				}

				onPropose() {
					return {
						[identifier]: {},
					}
				}
			}
		)
	} catch (err) {
		createErrorNotification(err)
	}
}

export async function loadCustomComponent(
	filePath: string,
	fileContent?: string
) {
	if (fileContent === undefined)
		fileContent = (
			await fs.readFile(filePath).catch(e => undefined)
		)?.toString('utf-8')
	if (fileContent === undefined) return

	const promises: Promise<unknown>[] = []

	if (extname(filePath) === '.js') {
		await loadJS(fileContent, promises)
	} else if (extname('.json')) {
		loadJSON(fileContent)
	}

	await Promise.all(promises)
}
