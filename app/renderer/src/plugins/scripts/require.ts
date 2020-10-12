import { TUIStore } from '../UI/store'
import { IDisposable } from '../../Types/disposable'
import { SidebarModule } from './modules/sidebar'
import { IModuleConfig } from './types'
import { UIModule } from './modules/ui'
import { NotificationModule } from './modules/footer'
import { FSModule } from './modules/fs'
import { ENVModule } from './modules/env'
import { UtilsModule } from './modules/utils'
import { ImportFileModule } from './modules/importFiles'
import { PathModule } from './modules/path'
import { FetchDefinitionModule } from './modules/fetchDefinition'
import { WindowModule } from './modules/windows'
import { GlobalsModule } from './modules/globals'
import { ToolbarModule } from './modules/toolbar'

const BuiltInModules = new Map<string, (config: IModuleConfig) => unknown>([
	['@bridge/ui', UIModule],
	['@bridge/sidebar', SidebarModule],
	['@bridge/notification', NotificationModule],
	['@bridge/fs', FSModule],
	['@bridge/path', PathModule],
	['@bridge/env', ENVModule],
	['@bridge/globals', GlobalsModule],
	['@bridge/utils', UtilsModule],
	['@bridge/file-importer', ImportFileModule],
	['@bridge/fetch-definition', FetchDefinitionModule],
	['@bridge/windows', WindowModule],
	['@bridge/toolbar', ToolbarModule],
])
//For usage inside of custom commands, components etc.
const LimitedModules = new Map<string, (config: IModuleConfig) => unknown>([
	['@bridge/notification', NotificationModule],
	['@bridge/fs', FSModule],
	['@bridge/path', PathModule],
	['@bridge/env', ENVModule],
	['@bridge/globals', GlobalsModule],
	['@bridge/utils', UtilsModule],
	['@bridge/fetch-definition', FetchDefinitionModule],
])

function createGenericEnv(
	disposables: IDisposable[] = [],
	uiStore?: TUIStore,
	modules = BuiltInModules
) {
	return async (importName: string) => {
		const module = modules.get(importName)
		if (module) return await module({ uiStore, disposables })
	}
}

export function createEnv(disposables: IDisposable[] = [], uiStore?: TUIStore) {
	return createGenericEnv(disposables, uiStore)
}
export function createLimitedEnv(
	disposables: IDisposable[] = [],
	uiStore?: TUIStore
) {
	return createGenericEnv(disposables, uiStore, LimitedModules)
}
