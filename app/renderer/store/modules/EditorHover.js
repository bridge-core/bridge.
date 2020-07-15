import Store from '../index'

const state = {
	is_visible: false,
	data: '',
	x_position: 0,
	y_position: 0,
	isImmutable: false,
}

const mutations = {
	showEditorHoverCard(state, { data, x_position, y_position, isImmutable }) {
		if (state.is_visible) {
			state.is_visible = false
			setTimeout(
				() =>
					Store.commit('showEditorHoverCard', {
						data,
						x_position,
						y_position,
						isImmutable,
					}),
				1
			)
		} else {
			state.is_visible = true
			state.data = data
			state.x_position = x_position
			state.y_position = y_position
			state.isImmutable = isImmutable
		}
	},
	hideEditorHoverCard(state) {
		state.is_visible = false
	},
}

const actions = {}

export default {
	state,
	mutations,
	actions,
}
