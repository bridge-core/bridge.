import { IModuleConfig } from '../types'
import { createNotification, INotification } from '../../../UI/Footer/create'
import { createErrorNotification } from '../../../AppCycle/Errors'

export const NotificationModule = ({ disposables }: IModuleConfig) => ({
	create(config: INotification) {
		const notification = createNotification(config)
		disposables.push(notification)
		return notification
	},
	createError(error: Error) {
		const notification = createErrorNotification(error)
		disposables.push(notification)
		return notification
	},
})
