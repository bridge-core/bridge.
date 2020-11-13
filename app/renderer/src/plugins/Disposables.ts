import { IDisposable } from '../Types/disposable'

const DisposableStore = new Map<string, IDisposable[]>()

export function set(pluginId: string, disposables: IDisposable[]) {
	if (DisposableStore.has(pluginId)) clear(pluginId)
	DisposableStore.set(pluginId, disposables)
}

export function clearAll() {
	DisposableStore.forEach((disposables, pluginId) => {
		disposables.forEach(disposable => disposable.dispose())
		DisposableStore.delete(pluginId)
	})
}

export function clear(pluginId: string) {
	DisposableStore.get(pluginId)?.forEach(disposable => disposable.dispose())
	DisposableStore.delete(pluginId)
}
