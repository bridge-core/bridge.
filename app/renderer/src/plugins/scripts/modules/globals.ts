import { IModuleConfig } from '../types'
import { CURRENT } from '../../../constants'
import { readJSON } from '../../../Utilities/JsonFS'
import { join } from 'path'
import { on } from '../../../AppCycle/EventSystem'

let cachedGlobals: Record<string, unknown> | undefined = undefined

on('bridge:onProjectChanged', () => {
	cachedGlobals = undefined
})

export const GlobalsModule = async ({}: IModuleConfig) => {
	if (cachedGlobals === undefined)
		cachedGlobals = await readJSON(
			join(CURRENT.PROJECT_PATH, 'globals.json')
		)

	return { ...cachedGlobals }
}
