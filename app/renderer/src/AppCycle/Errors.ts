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

async function collectLogs() {
	if (
		!Store.state.Settings.is_dev_mode &&
		process.env.NODE_ENV !== 'development'
	)
		return
	;((await ipcRenderer.invoke('bridge:requestMainThreadLogs')) as {
		type?: 'error' | 'warn' | 'default'
		data: unknown
	}[]).forEach(({ type, data }) => {
		if (type === 'warn') console.warn(data)
		else if (type === 'error') console.error(data)
		else console.log(data)
	})
}
setInterval(collectLogs, 2000)

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
