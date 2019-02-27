import Store from "../index";

const state = {
    is_visible: false,
    data: "",
    x_position: 0,
    y_position: 0
}

const mutations = {
    showEditorHoverCard(state, { data, x_position, y_position }) {
        if(state.is_visible) {
            state.is_visible = false;
            setTimeout(() => Store.commit("showEditorHoverCard", { data, x_position, y_position }), 1);
        } else {
            state.is_visible = true;
            state.data = data;
            state.x_position = x_position;
            state.y_position = y_position;
        }
    },
    hideEditorHoverCard(state) {
        state.is_visible = false;
    }
}

const actions = {

}

export default {
    state,
    mutations,
    actions
}