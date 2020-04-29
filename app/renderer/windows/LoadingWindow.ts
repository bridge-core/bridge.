import ContentWindow from '../src/commonWindows/Content'
import Store from '../store/index'
import uuidv4 from 'uuid/v4'

export default class LoadingWindow extends ContentWindow {
	store_id: string
	private timeout_id: number
	constructor(id = uuidv4()) {
		super(
			{
				options: {
					is_visible: false,
					is_frameless: true,
					height: 100,
				},
				content: [
					{
						type: 'header',
						text: 'Loading...',
					},
					{
						type: 'divider',
					},
					{
						type: 'loader',
					},
				],
			},
			'loading.'
		)

		Store.commit('addLoadingWindow', { id, window: this })
		this.store_id = id
	}

	show() {
		this.timeout_id = window.setTimeout(this.internalShow, 3000)
		return this
	}
	hide() {
		window.clearTimeout(this.timeout_id)
		this.updateVisibility(false)
		return this
	}
	close() {
		Store.commit('removePluginWindow', this.id)
		Store.commit('removeLoadingWindow', { id: this.store_id })
		return this
	}

	updateVisibility(val: boolean) {
		Store.commit('setWindowIsVisible', {
			id: this.id,
			val,
		})
	}
	internalShow() {
		Store.commit('setWindowIsVisible', {
			id: this.id,
			val: true,
		})
	}
}
