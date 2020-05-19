const state = {}

const mutations = {
	addLoadingWindow(state, {
		id,
		window
	}) {
		if (state[id] !== undefined) {
			state[id].push(window)
		} else {
			state[id] = [window]
		}
	},
	removeLoadingWindow(state, {
		id
	}) {
		if (state[id] === undefined) return
		state[id].forEach(w => w.hide())
		delete state[id]
	},
	removeAllLoadingWindows(state) {
		for (let id in state) {
			state[id].forEach(w => w.hide())
			delete state[id]
		}
	}
}

export default {
	state,
	mutations,
}