import Vue from "vue";

const state = {
    keywords: [
        "minecraft",
        "description",
        "events",
        "components",
        "component_groups"
    ],
    titles: [
        "event",
        "format_version"
    ],
    symbols: [
        "add",
        "remove",
        "sequence",
        "randomize"
    ],
    plugin_keywords: [],
    plugin_titles: [],
    plugin_symbols: []
}

const mutations = {
    addPluginKeywords(state, keywords) {
        keywords.forEach(keyword => state.plugin_keywords.push(keyword));
    },
    addPluginTitles(state, titles) {
        titles.forEach(title => state.plugin_titles.push(title));
    },
    addPluginSymbols(state, symbols) {
        symbols.forEach(symbol => state.plugin_symbols.push(symbol));
    },
    resetPluginHighlights() {
        Vue.set(state, "plugin_keywords", []);
        Vue.set(state, "plugin_titles", []);
        Vue.set(state, "plugin_symbols", []);
    }
}

const getters = {
    highlighter_keywords(state) {
        return state.keywords.concat(state.plugin_keywords);
    },
    highlighter_titles(state) {
        return state.titles.concat(state.plugin_titles);
    },
    highlighter_symbols(state) {
        return state.symbols.concat(state.plugin_symbols);
    }
}

export default {
    state,
    mutations,
    getters
}