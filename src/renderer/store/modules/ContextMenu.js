const state = {
    is_visible: false,
    x_position: 100,
    y_position: 100,
    active_state: "node",
    variants: {
        node: [
            {
                title: "Test"
            }
        ]
    },
    plugin_variants: {
        node: []
    }
}

const mutations = {
    setContextMenuVisibility(state, value) {
        // state.is_visible = value;
    },
    openContextMenu(state, { x_position, y_position, active_state }) {
        // state.is_visible = true;
        state.x_position = x_position;
        state.y_position = y_position;
        state.active_state = active_state;
    }
}

const getters = {
    current_context_menu_items(state) {
        return state.variants[state.active_state].concat(state.plugin_variants[state.active_state]);
    }
}

export default {
    state,
    mutations,
    getters
}