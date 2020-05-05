const state = {
	is_visible: false,
	x_position: 100,
	y_position: 100,
	menu: [],
}

const mutations = {
	setContextMenuVisibility(state, value) {
		state.is_visible = value
	},
	openContextMenu(state, { x_position, y_position, menu }) {
		state.is_visible = true
		state.x_position = x_position
		state.y_position = y_position
		state.menu = menu
	},
}

export default {
	state,
	mutations,
}
