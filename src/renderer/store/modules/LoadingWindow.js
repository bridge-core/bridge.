const state = {

}

const mutations = {
    addLoadingWindow(state, { id, window }) {
        state[id] = window;
    },
    removeLoadingWindow(state, { id }) {
        if(state[id] == undefined) return;
        state[id].hide();
        delete state[id];
    }
}

export default {
    state,
    mutations
}