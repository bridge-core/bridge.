import { IDisposable } from '../Types/disposable'

const DisposableStore = new Map<string, IDisposable[]>()

export function set(pluginId: string, disposables: IDisposable[]) {
	DisposableStore.set(pluginId, disposables)
}

export function clearAll() {
	DisposableStore.forEach(disposables => {
		disposables.forEach(disposable => disposable.dispose())
	})
}
