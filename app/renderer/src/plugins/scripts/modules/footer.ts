import { IModuleConfig } from '../types'
import { createNotification, INotification } from '../../../UI/Footer/create'

export const NotificationModule = ({ disposables }: IModuleConfig) => ({
	create(config: INotification) {
		const notification = createNotification(config)
		disposables.push(notification)
		return notification
	},
})
