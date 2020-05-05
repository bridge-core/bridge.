/**
 * Simple confirmation window. Rendered by components/windowFactory
 */
import Store from '../../../../store/index'
import { WindowDefinition } from './ContentTypes'

export interface confirmWindowConfig extends WindowDefinition {
	cancel_text?: string
	confirm_text?: string
}

export default class ConfirmWindow {
	id: string
	actions: any[]

	constructor(
		on_confirm: () => any,
		on_cancel: () => any,
		text: string,
		{ cancel_text, confirm_text, ...opts }: confirmWindowConfig = {}
	) {
		this.id = `main.core.windows.confirm_window.${Math.random()}`
		this.actions = [
			{
				type: 'space',
			},
			{
				type: 'button',
				text: cancel_text || 'Cancel',
				is_rounded: false,
				action: () => {
					this.close()
					if (typeof on_cancel == 'function') on_cancel()
				},
			},
			{
				type: 'button',
				text: confirm_text || 'Confirm',
				color: 'primary',
				is_rounded: false,
				action: () => {
					this.close()
					if (typeof on_confirm == 'function') on_confirm()
				},
			},
		]

		Store.commit('addPluginWindow', {
			actions: this.actions,
			content: [
				{
					type: 'header',
					text: 'Confirmation',
				},
				{
					type: 'divider',
				},
				{
					text: '\n',
				},
				{
					text,
				},
			],
			options: {
				is_frameless: true,
				height: 140,
			},
			is_visible: true,
			id: this.id,
			onClose: () => this.close(),
		})

		this.update(opts)
	}

	update(opts: confirmWindowConfig) {
		Store.commit('updatePluginWindow', { ...opts, id: this.id })
		return this
	}

	close() {
		Store.commit('removePluginWindow', this.id)
		return this
	}
}
