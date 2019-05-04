import dirTree from "../../../../node_modules/dirtree2json/lib/index";
import Vue from "vue";

const state = {
    project: {},
    files: {}
}

const mutations = {
    setExplorerProject(state, { store_key, project }) {
        Vue.set(state.project, store_key, project);
    },
    setExplorerFiles(state, files) {
        // state.files = files;
    },
    loadExplorerDirectory(state, { store_key, path }) {
        Vue.set(state.files, store_key, dirTree.dirTojson(path, {
            includeAbsolutePath: true
        }));
        console.log(state.files)
    }
}

export default {
    state,
    mutations
}