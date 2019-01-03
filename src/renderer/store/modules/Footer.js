import deepmerge from "deepmerge";
import Vue from "vue";

const state = {
    elements: []
}

const mutations = {
    addPluginFooter(state, footer_element) {
        state.elements.push({ ...footer_element })
    },
    updatePluginFooter(state, footer_element) {
        let i = 0;
        while(i < state.elements.length && state.elements[i].id != footer_element.id) {
            i++;
        }

        if(i < state.elements.length) {
            let tmp = deepmerge(state.elements[i], footer_element, { arrayMerge: (target, source) => [...source] });
            Vue.set(state.elements, i, tmp);
        }        
    },
    removePluginFooter(state, id) {
        let i = 0;
        while(i < state.elements.length && state.elements[i].id != id) {
            i++;
        }

        if(i < state.elements.length) state.elements.splice(i, 1);
    },
    resetPluginFooters() {
        state.elements = [];
    }
}

export default {
    state,
    mutations
}