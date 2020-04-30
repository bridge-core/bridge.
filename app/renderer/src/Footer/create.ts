import { NotificationStore } from './state'
import uuid from 'uuid/v4'
import Vue from 'vue'
import { IDisposable } from '../../src/Types/disposable'

export interface INotification {
	icon?: string
	message?: string
	color?: string
	textColor?: string

	onClick?: () => void
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

	let notificationUUID = uuid()
	Vue.set(NotificationStore, notificationUUID, config)

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
