const state = {
    project: "",
    files: {}
}

const mutations = {
    setExplorerProject(state, project) {
        state.project = project;
    },
    setExplorerFiles(state, files) {
        state.files = files;
    }
}

export default {
    state,
    mutations
}