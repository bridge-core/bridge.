import { IModuleConfig } from '../types'
import { shell } from 'electron'

export const UtilsModule = ({}: IModuleConfig) => ({
	openExternal: (url: string) => shell.openExternal(url),
})
