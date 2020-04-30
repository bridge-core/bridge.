import Bridge from '../../src/plugins/PluginEnv'
import Store from '../index'
import Vue from 'vue'
import Provider from '../../src/autoCompletions/Provider'
import FileType from '../../src/editor/FileType'
import EventBus from '../../src/EventBus'
import {
	PluginSnippets
} from '../../windows/Snippets'
import ThemeManager from '../../src/editor/ThemeManager'
import PluginLoader from '../../src/plugins/PluginLoader'

const state = {
	installed_plugins: [],
	current_loaded_project: '',
	is_menu_open: false,
}

const mutations = {
	loadPlugin(state, {
		code,
		path,
		blocked
	}) {
		Bridge.Interpreter.execute(code, path, undefined, undefined, blocked)

		//CONSOLE INFO
		// console.groupCollapsed(path.split(/\\|\//g).pop());
		// console.log(code);
		// console.groupEnd();
	},
	unloadPlugins(state) {
		Store.commit('resetPluginHighlights')
		Store.commit('resetPluginWindows')
		Bridge.hl.unregisterAll()
		Provider.removePluginFileDefs()
		Provider.removePluginCompletions()
		FileType.reset()
		Bridge.reset()
		PluginSnippets.removeAll()
		ThemeManager.reset()
		PluginLoader.reset()

		EventBus.trigger('bridge:unloadPlugins')
		Vue.set(state, 'installed_plugins', [])
	},
	finishedPluginLoading(state, addPlugins) {
		Vue.set(
			state,
			'installed_plugins',
			addPlugins.concat(Bridge.getPlugins())
		)
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