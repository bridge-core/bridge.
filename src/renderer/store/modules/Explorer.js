import dirTree from "../../../../node_modules/dirtree2json/lib/index";
import Vue from "vue";
import { ipcRenderer } from "electron";

const state = {
    project: {},
    files: {}
}

const mutations = {
    setExplorerProject(state, { store_key, project }) {
        Vue.set(state.project, store_key, project);
        //Set the pack_icon as an overlay
        // if(store_key === "explorer") ipcRenderer.send("bridge:setOverlayIcon", project);
    },
    loadExplorerDirectory(state, { store_key, path, force_reload }) {
        if(force_reload || state.files[store_key] === undefined) {
            Vue.set(state.files, store_key, dirTree.dirTojson(path, {
                includeAbsolutePath: true
            }));
        }
    }
}

export default {
    state,
    mutations
}