import { NotificationStore } from './state'
import uuid from 'uuid/v4'
import Vue from 'vue'
import { IDisposable } from '../../Types/disposable'

export interface INotification {
	icon?: string
	message?: string
	color?: string
	textColor?: string
	disposeOnMiddleClick?: boolean

	onClick?: () => void
	onMiddleClick?: () => void
}

export interface ITimedNotification extends INotification {
	expiration: number

	onExpired?: () => void
}

/**
 * Creates a new notification
 * @param config
 */
export function createNotification(config: INotification): IDisposable {
	if (!config.onClick) config.onClick = () => {}
	if (!config.onMiddleClick) config.onMiddleClick = () => {}

	let notificationUUID = uuid()
	Vue.set(NotificationStore, notificationUUID, {
		...config,
		onMiddleClick: () => {
			config.onMiddleClick()
			if (config.disposeOnMiddleClick)
				Vue.delete(NotificationStore, notificationUUID)
		},
	})

	return {
		dispose: () => {
			Vue.delete(NotificationStore, notificationUUID)
		},
	}
}

/**
 * Creates a new timed notification
 * @param config
 */
export function createTimedNotification(
	config: ITimedNotification
): IDisposable {
	let notification = createNotification(config)

	setTimeout(() => {
		notification.dispose()
		if (config.onExpired) config.onExpired()
	}, config.expiration - Date.now())

	return {
		...notification,
	}
}

export function clearAllNotifications() {
	for (const [key] of Object.entries(NotificationStore)) {
		Vue.delete(NotificationStore, key)
	}
}
