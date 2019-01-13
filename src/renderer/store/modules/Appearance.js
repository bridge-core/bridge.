const state = {
    is_dark_mode: true,
    files: {
        html: 'mdi-language-html5',
        js: 'mdi-nodejs',
        json: 'mdi-json',
        md: 'mdi-markdown',
        pdf: 'mdi-file-pdf',
        png: 'mdi-file-image',
        txt: 'mdi-file-document-outline',
        xls: 'mdi-file-excel'
    }
}

const mutations = {
    toggleDarkMode(state) {
        state.is_dark_mode = !state.is_dark_mode;
    },
    setDarkMode(state, val) {
        state.is_dark_mode = val;
    }
}

const actions = {

}

export default {
    state,
    mutations,
    actions
}