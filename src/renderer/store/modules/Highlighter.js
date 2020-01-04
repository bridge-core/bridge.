import Vue from "vue";
import FileType from "../../scripts/editor/FileType";
import ProjectConfig from "../../scripts/Project/Config";

function getHighlighterDef() {
    return FileType.getHighlighter().define;
}

const state = {
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
    highlighter_keywords(state, getters) {
        return () => getHighlighterDef().keywords.concat(state.plugin_keywords).concat([ProjectConfig.getPrefixSync()]);
    },
    highlighter_titles(state, getters) {
        return () => getHighlighterDef().titles.concat(state.plugin_titles);
    },
    highlighter_symbols(state, getters) {
        return () => getHighlighterDef().symbols.concat(state.plugin_symbols);
    }
}

export default {
    state,
    mutations,
    getters
}