const state = {

}

const mutations = {
    addLoadingWindow(state, { id, window }) {
        if(state[id] != undefined) {
            state[id].push(window);
        } else {
            state[id] = [window];
        }
        console.log(state[id] != undefined);
        // window.show();
        
    },
    removeLoadingWindow(state, { id }) {
        if(state[id] == undefined) return;
        state[id].forEach( w => w.hide());
        delete state[id];
    }
}

export default {
    state,
    mutations
}