import dirTree from "../../../../node_modules/dirtree2json/lib/index";
import Vue from "vue";
import { ipcRenderer } from "electron";

function setIsOpen(path, is_open, current, first=true) {
    if(first) path.shift();
    if(current === undefined) return;

    if(path.length === 0) {
        return Vue.set(current, "is_open", is_open || !current.is_open);
    } else {
        let key = path.shift();
        setIsOpen(path, is_open, current.child.find(e => e.name === key), false);
    }
}

const state = {
    project: {},
    files: {},
    loaded_project: {}
}

const mutations = {
    setExplorerProject(state, { store_key, project }) {
        Vue.set(state.project, store_key, project);
        //Set the pack_icon as an overlay
        // if(store_key === "explorer") ipcRenderer.send("bridge:setOverlayIcon", project);
    },
    loadExplorerDirectory(state, { store_key, path, force_reload }) {
        if(state.loaded_project[store_key] !== state.project[store_key] || state.files[store_key] === undefined || force_reload) {
            Vue.set(state.loaded_project, store_key, state.project[store_key]);
            Vue.set(state.files, store_key, dirTree.dirTojson(path, {
                includeAbsolutePath: true
            }));
        }
    },
    setExplorerIsDirOpen(state, { store_key, path, is_open }) {
        setIsOpen(path.split("/"), is_open, state.files[store_key])
    }
}

export default {
    state,
    mutations
}