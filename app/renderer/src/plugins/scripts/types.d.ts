import { IDisposable } from '../../Types/disposable'
import { TUIStore } from '../UI/store'

export interface IModuleConfig {
	uiStore: TUIStore
	disposables: IDisposable[]
}
