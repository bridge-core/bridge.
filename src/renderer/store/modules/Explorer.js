const state = {
    project: ""
}

const mutations = {
    setExplorerProject(state, project) {
        state.project = project;
    }
}

export default {
    state,
    mutations
}