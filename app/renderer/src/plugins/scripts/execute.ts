import { run } from '../../editor/ScriptRunner/run'
import { createEnv } from './env'
import { TUIStore } from '../UI/store'
import { IDisposable } from '../../Types/disposable'

export function executeScript(
	code: string,
	uiStore: TUIStore,
	disposables: IDisposable[]
) {
	return run(code, createEnv(uiStore, disposables), 'file')
}
