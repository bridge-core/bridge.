import { promises as fs } from 'fs'
import { createErrorNotification } from '../../AppCycle/Errors'
import ComponentRegistry from '../CustomComponents'
import { createLimitedEnv } from '../scripts/require'
import { run } from '../../editor/ScriptRunner/run'
import { extname } from 'path'
import { IDisposable } from '../../Types/disposable'
import { createInformationWindow } from '../../UI/Windows/Common/CommonDefinitions'

export async function loadJS(
	fileContent: string,
	disposables: IDisposable[],
	promises: Promise<unknown>[] = []
) {
	try {
		await run(
			fileContent,
			[
				createLimitedEnv(),
				{
					register: (c: any) => {
						promises.push(
							ComponentRegistry.register(c).then(disposable =>
								disposables.push(disposable)
							)
						)
					},
					report: (info: string) =>
						createInformationWindow('Information', info),
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

export async function loadJSON(fileContent: string) {
	try {
		const {
			description: { identifier = undefined, ...description } = {},
			...entity
		} = JSON.parse(fileContent)['bridge:component']

		if (!identifier) {
			createErrorNotification(
				new Error('Custom component must include component name')
			)
			return { dispose: () => {} }
		}

		return await ComponentRegistry.register(
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
	disposables: IDisposable[],
	fileContent?: string
) {
	if (fileContent === undefined)
		fileContent = (
			await fs.readFile(filePath).catch(e => undefined)
		)?.toString('utf-8')
	if (fileContent === undefined) return

	const promises: Promise<unknown>[] = []

	if (extname(filePath) === '.js') {
		await loadJS(fileContent, disposables, promises)
	} else if (extname('.json')) {
		disposables.push(await loadJSON(fileContent))
	}

	await Promise.all(promises)
}
