import Vue from 'vue'
import Store from '../index'

const alias = { is_dark_mode: 'setDarkMode' }

const state = {
	is_dev_mode: false,
}

const mutations = {
	setSetting(state, { id, data }) {
		Vue.set(state, id, data)
	},
	setSettings(state, data) {
		for (let key in data) {
			if (key in alias) Store.commit(alias[key], data[key])
			else mutations.setSetting(state, { id: key, data: data[key] })
		}
	},
}

const getters = {}

export default {
	state,
	mutations,
	getters,
}
