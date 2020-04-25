import { createFileRunner } from '../runFile'
import { ENV } from './ENV'

export const runCompilationFile = createFileRunner('compile', ENV)
