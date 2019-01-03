import Bridge from "../../scripts/plugins/PluginEnv";
import Store from "../index";
import Vue from "vue";
import fs from "fs";
import DirToJSON from "dir-to-json";

const state = {
    installed_plugins: [],
    current_loaded_project: "",
    is_menu_open: false,
    cache: {}
}

const mutations = {
    forceReloadNextPluginRequest(state) {
        state.current_loaded_project = "";
    },
    loadAllPlugins(state, { args, base_path, selected }) {
        if(state.current_loaded_project != selected) {
            //Handle unloading & caching loaded porject
            Store.commit("unloadPlugins");
            state.current_loaded_project = selected;

            //SEARCH BRIDGE DIRECTORY
            let index = 0, child = args.files.children[0];
            while(child.name != "bridge" && child.name < "bridge") {
                index++;
                child = arg.files[index];
            }
            //Do stuff if bridge directory exists
            if(child.name == "bridge") {
                let uninstalled = Bridge.Interpreter.init(selected);

                child.children.forEach(e => {
                    //LOAD PLUGINS
                    if(e.name == "plugins") {
                        e.children.forEach(plugin => {
                            if(plugin.type != "directory") {
                                Store.commit("loadPlugin", { 
                                    code: fs.readFileSync(base_path + selected + "/" + plugin.path).toString(),
                                    path: plugin.path,
                                    blocked: uninstalled.includes(plugin.path)
                                });
                            }
                        });
                    }
                });
                
                state.cache = {
                    args,
                    base_path,
                    selected
                };

                Store.commit("finishedPluginLoading");
            }
        }
    },
    refreshAllPlugins(state, load_dir=false) {
        if(load_dir) {
            DirToJSON(state.cache.base_path + state.current_loaded_project, (err, files) => {
                if(err) console.log(err);
        
                Store.commit("setPluginCache", {
                    args: { files },
                    selected: state.current_loaded_project,
                    base_path: state.cache.base_path 
                });
                Store.commit("refreshAllPlugins");
            });
            
        } else {
            Store.commit("forceReloadNextPluginRequest");
            Store.commit("loadAllPlugins", state.cache);
        }
    },
    setPluginCache(state, cache) {
        state.cache = cache;
    },

    loadPlugin(state, { code, path, blocked }) {
        Bridge.Interpreter.execute(code, path, undefined, undefined, blocked);

        //CONSOLE INFO
        console.groupCollapsed(path.split(/\\|\//g).pop());
        console.log(code);
        console.groupEnd();
    },
    unloadPlugins(state) {
        if(Bridge.getMenus()) Bridge.getMenus().forEach(menu => Store.commit("removeFromAppMenu", menu));
        Store.commit("resetPluginSidebars");
        Store.commit("resetPluginHighlights");
        Store.commit("resetPluginFooters");
        Store.commit("resetPluginWindows");
        Bridge.hljs.unregisterAll();
        
        Bridge.reset();
        Vue.set(state, "installed_plugins", []);
        state.current_loaded_project = "";
    },

    //Doesn't actually fire after the plugin was loaded. It fires after all Bridge contexts have been initialized
    finishedPluginLoading(state) {
        Vue.set(state, "installed_plugins", Bridge.getPlugins());
    },

    //GENERAL
    setPluginMenuOpen(state, value=true) {
        state.is_menu_open = value;
    }
}

const getters = {
    unknown_plugins(state) {
        return state.installed_plugins.filter(plugin => plugin == "unknown").length;
    },
    modules_loaded(state) {
        return state.installed_plugins.filter(plugin => plugin == "module").length;
    }
}

export default {
    getters,
    state,
    mutations
}