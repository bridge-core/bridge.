import { createFileRunner } from '../runFile'
import { ENV } from './ENV'

export const runValidationFile = createFileRunner('validate', ENV)
