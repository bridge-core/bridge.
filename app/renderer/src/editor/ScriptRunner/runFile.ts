import JSONTree from '../JsonTree'
import { prepareRun, runFunction } from './run'
import { join } from 'path'
import { promises as fs } from 'fs'
import EventBus from '../../EventBus'

declare const __static: string

export type TFileRunner = (
	fileName: string,
	...args: unknown[]
) => Promise<unknown>
export function createFileRunner(
	directory: string,
	ENV: (...args: unknown[]) => unknown
): TFileRunner {
	let CACHE: {
		[fileName: string]: (Bridge: unknown) => void
	} = {}
	EventBus.on('bridge:changedProject', () => (CACHE = {}))

	return async function runFile(fileName: string, ...args: unknown[]) {
		if (CACHE[fileName] !== undefined)
			return runFunction(CACHE[fileName], ENV(...args))

		let func = prepareRun(
			(await fs.readFile(join(__static, directory, fileName))).toString(
				'utf-8'
			)
		)
		CACHE[fileName] = func
		return runFunction(func, ENV(...args))
	}
}
