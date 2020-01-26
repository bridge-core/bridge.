const state = {
	split_screen_active: false,
}

const mutations = {
	setSplitScreenActive(state, val) {
		state.split_screen_active = val
	},
}

export default {
	state,
	mutations,
}
