import { createNotification } from '../UI/Footer/create'
import { IDisposable } from '../Types/disposable'
import InformationWindow from '../UI/Windows/Common/Information'
import Store from '../../store/index'
import { ipcRenderer } from 'electron'

window.addEventListener('error', event => {
	createErrorNotification(event.error)
	Store.commit('removeAllLoadingWindows')
})

window.onunhandledrejection = (event: PromiseRejectionEvent) => {
	createErrorNotification(new Error(event.reason))
	Store.commit('removeAllLoadingWindows')
}

ipcRenderer.on('bridge:consoleLog', (_, data) => console.log(data))
ipcRenderer.on('bridge:consoleWarn', (_, data) => console.warn(data))
ipcRenderer.on('bridge:consoleError', (_, data) => console.error(data))

/**
 * Creates a new error notification
 * @param config
 */
export function createErrorNotification(error: Error): IDisposable {
	const message = error.message
	let short: string
	if (message.includes(': ')) short = message.split(': ').shift()
	if (!short || short.length > 12)
		short = message.length > 12 ? `${message.substr(0, 11)}...` : message

	let notification = createNotification({
		icon: 'mdi-exclamation',
		message: short,
		color: 'error',
		onClick: () => {
			new InformationWindow(`ERROR: ${short}`, message)
			notification.dispose()
		},
	})

	return {
		...notification,
	}
}
