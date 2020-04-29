import Vue from 'vue'

const state = {
	project: {},
	files: {},
	loaded_project: {},
}

const mutations = {
	setExplorerProject(state, {
		store_key,
		project
	}) {
		Vue.set(state.project, store_key, project)
		//Set the pack_icon as an overlay
		// if(store_key === "explorer") ipcRenderer.send("bridge:setOverlayIcon", project);
	},
}

export default {
	state,
	mutations,
}