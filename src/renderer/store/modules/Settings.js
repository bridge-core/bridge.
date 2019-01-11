import Vue from "vue";

const state = {
    is_dev_mode: false
}

const mutations = {
    setSetting(state, { id, data }) {
        Vue.set(state, id, data);
    }
}

const getters = {

}

export default {
    state,
    mutations,
    getters
}