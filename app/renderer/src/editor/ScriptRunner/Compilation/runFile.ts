import { createFileRunner } from '../runFile'
import { ENV } from './ENV'
import { run } from '../run'
import JSONTree from '../../JsonTree'

export const runCompilationFile = createFileRunner('compile', ENV)
export const runCompilation = (
	code: string,
	node: JSONTree,
	filePath?: string
) => run(code, ENV([], node, filePath), { executionContext: 'file' })
