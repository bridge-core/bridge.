import { TUIStore } from '../UI/store'
import { IDisposable } from '../../Types/disposable'
import { createSidebar } from '../../UI/Sidebar/create'

export function createEnv(uiStore: TUIStore, disposables: IDisposable[]) {
	return async (importName: string) => {
		if (importName === 'ui') return uiStore.UI
		else if (importName === 'sidebar')
			return {
				create({
					displayName,
					component,
					icon,
				}: {
					displayName: string
					component: string
					icon: string
				}) {
					disposables.push(
						createSidebar({
							displayName,
							icon,
							component,
						})
					)
					return disposables[disposables.length - 1]
				},
			}
	}
}
