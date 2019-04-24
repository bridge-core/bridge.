import { ipcRenderer } from "electron";
import Bridge from "../../scripts/plugins/PluginEnv";
import Store from "../index";
import Vue from "Vue";
import Path from "../../scripts/editor/Path";
import JSONInternal from "../../scripts/editor/Json";
import fs from "fs";

// ipcRenderer.on("openFile", (event, path) => {
//     Store.commit("addToTabSystem", {
//         file: path.split(/\\|\//g).pop(),
//         path,
//         content: fs.readFileSync(path),
//         category: Store.state.Explorer.project
//     });
// });

const state = {
    base_path: `${process.env.LOCALAPPDATA.replace(/\\/g, "/")}/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/development_behavior_packs/`,
    selected_tab: 0,
    open_files: []
}

const mutations = {
    addToTabSystem(state, details) {
        console.warn("Using the TabSystem store is deprecated!");
        // let category = details.category || details.path.split("/").shift();

        // if(!state.open_files.contains(details, (e1, e2) => {
        //     return e1.path === e2.path;
        // })) {
        //     console.log("[OPEN] " + details.path);
        //     console.log(details);
            
        //     state.open_files.unshift({
        //         ...details,
        //         category,
        //         undo: [],
        //         redo: [],
        //         uuid: `${category}-${Math.random()}-${Math.random()}`,
        //         compiled: false,
        //         current_internal_path: "global" //Path inside a JSON file
        //     });

        //     state.selected_tab = 0;
        // } else {
        //     state.selected_tab = findFile(state.open_files.filter(file => file.category == category), details.path);
        // }
    },
    closeTab(state, i) {
        console.warn("Using the TabSystem store is deprecated!");
        // state.open_files.splice(i, 1);
    },
    closeCurrentTab(state) {
        console.warn("Using the TabSystem store is deprecated!");
        // if(state.selected_tab != -1) state.open_files.splice(state.selected_tab, 1);
    },

    setSelectedTab(state, tab_id) {
        console.warn("Using the TabSystem store is deprecated!");
        // state.selected_tab = tab_id;
    },
    toggleProjectFilter(state) {
        console.warn("Using the TabSystem store is deprecated!");
        // state.project_filter = !state.project_filter;
    },
    setTabContent(state, { tab, content }) {
        console.warn("Using the TabSystem store is deprecated!");
        // Vue.set(state.open_files.filter(file => file.category == Store.state.Explorer.project)[tab], "content", content);
    },
    setTabCompiled(state, tab) {
        console.warn("Using the TabSystem store is deprecated!");
        // Vue.set(state.open_files.filter(file => file.category == Store.state.Explorer.project)[tab], "compiled", true);
    },
    setTabContentWithPath(state, { tab_id, val, key, edit }) {
        console.warn("Using the TabSystem store is deprecated!");
        // let tab = state.open_files.filter(file => file.category == Store.state.Explorer.project)[tab_id];
        // let path = new Path(tab.current_internal_path);
        // let obj = JSON.parse(tab.content);
        // path.shift();

        // if(edit) {
        //     if(path.typeWalk(obj) == "object") {
        //         path.pop();
        //         path.add(obj, key, undefined, tab.compiled);
        //     } else{
        //         path.add(obj, path.pop(), val, tab.compiled);
        //     }
        // } else {
        //     if(key == "#&__path-pop__;") {
        //         key = path.pop();
        //     } else {
        //         Store.commit("setCurrentInternalFilePath", tab.current_internal_path + "/" + key);
        //     }

        //     path.add(obj, key, val, tab.compiled);
        // }
        
        // tab.content = JSON.stringify(obj);
    },

    saveCurrentFile(state) {
        console.warn("Using the TabSystem store is deprecated!");
        // let file_data = state.open_files.filter(file => file.category == Store.state.Explorer.project)[state.selected_tab];
        // if(file_data) {
        //     console.log("[SAVE] " + file_data.path);
        //     if(file_data.compiled) {
        //         console.log("Hey")
        //         //SAVING JSON FILES
        //         console.log(JSON.parse(file_data.content));
                
        //         file_data = Bridge.trigger("save", { ...file_data, content: JSONInternal.Format.toJSON(JSON.parse(file_data.content)) });
        //         console.log(file_data);
                
        //         ipcRenderer.send("saveFile", { path: file_data.path, content: JSON.stringify(file_data.content, null, "\t") });
        //     } else {
        //         //SAVING NORMAL FILES
        //         file_data = Bridge.trigger("save", file_data);

        //         ipcRenderer.send("saveFile", { path: file_data.path, content: file_data.content });
        //     }
        // }
    },
    saveCurrentFileAs(state) {
        console.warn("Using the TabSystem store is deprecated!");
        // let file_data = state.open_files.filter(file => file.category == Store.state.Explorer.project)[state.selected_tab];
        // if(file_data) {
        //     console.log("[SAVE AS] " + file_data.path);

        //     //SAVING NORMAL FILES
        //     file_data = Bridge.trigger("save", file_data);

        //     ipcRenderer.send("saveAsFileDialog", { path: file_data.path, content: file_data.content });
        // }
    },
    setCurrentInternalFilePath(state, p) {
        console.warn("Using the TabSystem store is deprecated!");
        // return state.open_files.filter(file => file.category == Store.state.Explorer.project)[state.selected_tab].current_internal_path = p;
    },
    expandCurrentInternalFilePath(state, p) {
        console.warn("Using the TabSystem store is deprecated!");
        // return state.open_files.filter(file => file.category == Store.state.Explorer.project)[state.selected_tab].current_internal_path += p;
    }
}

const actions = {

}

const getters = {
    open_files: (state, getters, root_state) => () => {
        console.warn("Using the TabSystem store is deprecated!");
        // return state.open_files.filter(file => file.category == root_state.Explorer.project);
    },
    current_category: (state, getters) => () => {
        console.warn("Using the TabSystem store is deprecated!");
        // let selected = getters.open_files()[state.selected_tab];
        // if(selected) return selected.category;
    },
    current_selected_file: (state, getters, root_state) => () => {
        console.warn("Using the TabSystem store is deprecated!");
        // return getters.open_files()[state.selected_tab];
    },
    current_internal_file_path: (state, getters, root_state) => () => {
        console.warn("Using the TabSystem store is deprecated!");
        // return getters.current_selected_file().current_internal_path;
    },
    current_edit_selected: (state, getters) => () => {
        console.warn("Using the TabSystem store is deprecated!");
        // let tab = getters.current_selected_file();
        // if(tab.current_internal_path == "global") return "";
        // let path = new Path(tab.current_internal_path);
        // path.shift();

        // return path.keyWalk(JSON.parse(tab.content))
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}


//UTILITIES
Array.prototype.contains = function(element2, compare=(e1, e2) => e1===e2) {
    console.warn("Using Array.prototype.contains is deprecated!");
    for(let element of this) {
        if(compare(element, element2)) {
            return true;
        }
    }
    return false;
};

function findFile(arr, path) {
    for(let i = 0; i < arr.length; i++) {
        if(arr[i].path == path) {
            return i;
        }
    }
    return -1;
}