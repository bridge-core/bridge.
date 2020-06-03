import { promises as fs } from 'fs'
import { IModuleConfig } from '../types'
import { readJSON, writeJSON } from '../../../Utilities/JsonFS'

export const FSModule = ({}: IModuleConfig) => ({
	...fs,
	readJSON,
	writeJSON,
})
