import Vue from "vue";
import Store from "../index";
import detachObj from "../../scripts/detachObj";
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
    },

    addPluginWindow(state, window) {
        let i = 0;
        while(i < state.elements.length && state.elements[i].id != window.id) {
            i++;
        }

        if(i == state.elements.length) state.elements.push(detachObj({}, window));
        
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
    },
    removePluginWindow(state, id) {
        let i = 0;
        while(i < state.elements.length && state.elements[i].id != id) {
            i++;
        }

        if(i < state.elements.length) {
            Vue.set(state.elements[i], "is_visible", false);
            setTimeout(() => {
                Store.commit("__internal_remove", i)
            }, 400);
        } 
    },
    __internal_remove(state, index) {
        if(state.elements.length > index) state.elements.splice(index, 1);
    },
    resetPluginWindows(state) {
        state.elements = [];
    }
}


export default {
    state,
    mutations
}