import Vue from 'vue'

const state = {
	installed_plugins: [],
	current_loaded_project: '',
	is_menu_open: false,
}

const mutations = {
	unloadPlugins(state) {
		Vue.set(state, 'installed_plugins', [])
	},
	finishedPluginLoading(state, addPlugins) {
		state.installed_plugins = Array.from(
			addPlugins
		).sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
	},

	//GENERAL
	setPluginMenuOpen(state, value = true) {
		state.is_menu_open = value
	},
}

const getters = {
	unknown_plugins(state) {
		return state.installed_plugins.filter(plugin => plugin == 'unknown')
			.length
	},
	modules_loaded(state) {
		return state.installed_plugins.filter(plugin => plugin == 'module')
			.length
	},
}

export default {
	getters,
	state,
	mutations,
}
