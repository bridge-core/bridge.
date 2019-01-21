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
    },
    color_theme: {
        dark: {
            property: "color: #a6e22e;",
            keyword: "color: #f92672;",
            definition: "color: #fd971f;",
            atom: "color: #ae81ff;",
            number: "color: #ae81ff;",
            string: "color: #e6db74;",
            variable: "color: #9effff;",
            variable_strong: "color: #66d9ef;",
            meta: "color: white;",
            comment: "color: #75715e;"
        },
        light: {
            property: "color: black;",
            keyword: "color: #5A5CAD;",
            definition: "text-decoration: underline;",
            atom: "color: #6C8CD5;",
            number: "color: #164;",
            string: "color: red;",
            variable: "color: black;",
            variable_strong: "color: black;",
            meta: "color: yellow;",
            comment: "color: #0080FF;"
        }
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