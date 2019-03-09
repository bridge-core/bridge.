import Store from "../index";
import Bridge from "../../scripts/plugins/PluginEnv";
import detachObj from "../../scripts/detachObj";
import Vue from "vue";

const state = {
    menu_state: 1,
    items: [
        {
            title: "Explorer",
            icon: "folder",
            menu_type: "explorer"
        },
        {
            title: "Documentation",
            icon: "mdi-book-open-page-variant",
            menu_type: "documentation"
        },
        {
            title: "Extensions",
            icon: "extension",
            menu_type: "extensions"
        }
    ],
    plugin_items: []
}

const mutations = {
    setSidebarMenu(state, new_menu_state) {
        state.menu_state = new_menu_state;
        let opened = getters.all_items(state)[new_menu_state - 1];

        Bridge.trigger("bridge:openedSidebar", opened ? opened.id || opened.menu_type : null, true);
    },
    toggleSidebarMenu(state) {
        state.menu_state = !state.menu_state;
    },

    //PLUGINS
    addPluginSidebar(state, new_sidebar) {
        let i = 0;
        while(i < state.plugin_items.length && state.plugin_items[i].id != new_sidebar.id) {
            i++;
        }

        if(i == state.plugin_items.length) state.plugin_items.push(detachObj({}, {
            ...new_sidebar,
            is_plugin: true
        }));

        Store.commit("sortPluginSidebars");
    },
    updatePluginSidebar(state, new_sidebar) {
        let i = 0;
        while(i < state.plugin_items.length && state.plugin_items[i].id != new_sidebar.id) {
            i++;
        }

        if(i < state.plugin_items.length) {
            let tmp = detachObj(state.plugin_items[i], { ...new_sidebar, is_plugin: true });
            
            Vue.set(state.plugin_items, i, tmp);
        }
    },
    removePluginSidebar(state, id) {
        let i = 0;
        while(i < state.plugin_items.length && state.plugin_items[i].id != id) {
            i++;
        }

        if(i < state.plugin_items.length) state.plugin_items.splice(i, 1);
        if(state.menu_state - 1 == i  + state.items.length) Store.commit("setSidebarMenu", 0);
    },
    openPluginSidebar(state, id) {
        let i = 0;
        while(i < state.plugin_items.length && state.plugin_items[i].id != id) {
            i++;
        }
        
        Store.commit("setSidebarMenu", i + state.items.length + 1);
    },
    resetPluginSidebars(state) {
        state.plugin_items = [];
    },
    sortPluginSidebars(state) {
        state.plugin_items.sort((a,b) => {
            if(a.title > b.title) return 1;
            if(a.title < b.title) return -1;
            return 0;
        });
    }
}

const getters = {
    all_items(state, getters) {
        Store.commit("sortPluginSidebars");
        return state.items.concat(state.plugin_items);
    }
}

export default {
    state,
    mutations,
    getters
}