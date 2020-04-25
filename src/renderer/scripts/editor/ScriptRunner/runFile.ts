import JSONTree from '../JsonTree'
import { prepareRun } from './run'
import { join } from 'path'
import { promises as fs } from 'fs'
import EventBus from '../../EventBus'

declare const __static: string

export function createFileRunner(
	directory: string,
	ENV: (node: JSONTree, filePath: string) => unknown
) {
	let CACHE: {
		[fileName: string]: (Bridge: unknown) => void
	} = {}
	EventBus.on('bridge:changedProject', () => (CACHE = {}))

	return async function runFile(
		fileName: string,
		node: JSONTree,
		filePath: string
	) {
		if (CACHE[fileName] !== undefined)
			return CACHE[fileName](ENV(node, filePath))

		let func = prepareRun(
			(await fs.readFile(join(__static, directory, fileName))).toString(
				'utf-8'
			)
		)
		CACHE[fileName] = func
		return func(ENV(node, filePath))
	}
}
