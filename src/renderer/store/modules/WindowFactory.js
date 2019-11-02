import Vue from "vue";
import Store from "../index";
import detachObj from "../../scripts/mergeUtils";
const state = {
    elements: []
}

const mutations = {
    setWindowIsVisible(state, { id, val }) {
        let i = 0;
        while(i < state.elements.length && state.elements[i].id != id) {
            i++;
        }

        if(i < state.elements.length) Vue.set(state.elements[i], "is_visible", val);
        else if(id) console.error("Unknown window ID: " + id);
    },

    addPluginWindow(state, window) {
        let i = 0;
        while(i < state.elements.length && state.elements[i].id !== window.id) {
            i++;
        }

        if(i === state.elements.length) state.elements.push(detachObj({}, window));       
    },
    updatePluginWindow(state, window) {
        let i = 0;
        while(i < state.elements.length && state.elements[i].id != window.id) {
            i++;
        }

        if(i < state.elements.length) {
            let tmp = detachObj(state.elements[i], window);
            Vue.set(state.elements, i, tmp);
        }
        else if(window.id) console.error("Unknown window ID: " + window.id);
    },
    removePluginWindow(state, id) {
        let i = 0;
        while(i < state.elements.length && state.elements[i].id != id) {
            i++;
        }

        if(i < state.elements.length) {
            Vue.set(state.elements[i], "is_visible", false);
            setTimeout(() => {
                Store.commit("__plugin_window_internal_remove", { index: i, id });
            }, 400);
        } 
        else if(id) console.error("Unknown window ID: " + id);
    },
    __plugin_window_internal_remove(state, { index, id }) {
        if(state.elements.length > index && state.elements[index].id === id) state.elements.splice(index, 1);
    },
    resetPluginWindows(state) {
        //Filter out plugin windows and keep native windows
        state.elements = state.elements.filter(w => !w.is_plugin);
    }
}


export default {
    state,
    mutations
}