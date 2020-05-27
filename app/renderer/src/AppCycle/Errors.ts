import { createNotification } from '../UI/Footer/create'
import { IDisposable } from '../Types/disposable'
import InformationWindow from '../UI/Windows/Common/Information'
import Store from '../../store/index'

window.addEventListener('error', event => {
	createErrorNotification(event.error)
	Store.commit('removeAllLoadingWindows')
})

window.onunhandledrejection = (event: PromiseRejectionEvent) => {
	createErrorNotification(new Error(event.reason))
	Store.commit('removeAllLoadingWindows')
}

/**
 * Creates a new error notification
 * @param config
 */
export function createErrorNotification(error: Error): IDisposable {
	const message = error.message
	let short: string
	if (message.includes(': ')) short = message.split(': ').shift()
	if (!short || short.length > 24)
		short = message.length > 24 ? `${message.substr(0, 23)}...` : message

	let notification = createNotification({
		icon: 'mdi-alert-circle-outline',
		message: short,
		color: 'error',
		disposeOnMiddleClick: true,
		onClick: () => {
			new InformationWindow(`ERROR: ${short}`, message)
			notification.dispose()
		},
	})

	return {
		...notification,
	}
}
