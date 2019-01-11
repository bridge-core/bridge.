import Vue from "vue";

const state = {
    is_dev_mode: false
}

const mutations = {
    setSetting(state, { id, data }) {
        Vue.set(state, id, data);
    },
    setSettings(state, data) {
        for(let key in data) {
            mutations.setSetting(state, { id: key, data: data[key] })
        }
    }
}

const getters = {

}

export default {
    state,
    mutations,
    getters
}