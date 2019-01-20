import KeyManager from "../../scripts/appMenu/KeyManager";
import Vue from "vue";
import Store from "../index";
import { ipcRenderer, shell } from "electron";
import SettingsWindow from "../../windows/Settings";
import CreateFileWindow from "../../windows/CreateFile";
import TabSystem from "../../scripts/TabSystem";

const state = {
    file: {
        trusted: true,
        display_name: "File",
        elements: [
            {
                title: "New File",
                shortcut: "Ctrl + N",
                action: () => new CreateFileWindow()
            },
            {
                title: "Open File",
                shortcut: "Ctrl + O",
                action: () => ipcRenderer.send("openFileDialog")
            },
            {
                type: "divider"
            },
            {
                title: "Save",
                shortcut: "Ctrl + S",
                action: () => TabSystem.saveCurrent()
            },
            {
                title: "Save As...",
                shortcut: "Ctrl + Shift + S",
                action: () => TabSystem.saveCurrentAs()
            },
            {
                type: "divider"
            },
            {
                title: "Close Editor",
                shortcut: "Ctrl + W",
                action: () => TabSystem.closeSelected()
            },
            {
                type: "divider"
            },
            {
                type: "submenu",
                title: "Preferences",
                elements: [
                    {
                        title: "Settings",
                        action: () => {
                            new SettingsWindow();
                        }
                    },
                    {
                        title: "Extensions",
                        action: () => Store.commit("setPluginMenuOpen")
                    }
                ]
            }
        ]
    },
    edit: {
        trusted: true,
        display_name: "Edit",
        elements: [
            {
                title: "Unselect",
                shortcut: "Escape",
                action: () => TabSystem.setCurrentFileNav("global")
            },
            // {
            //     title: "Select Next",
            //     shortcut: "WIP",
            //     action: () => console.log("Unselect me!")
            // },
            // {
            //     title: "Select Previous",
            //     shortcut: "WIP",
            //     action: () => console.log("Unselect me!")
            // },
            {
                type: "divider"
            },
            {
                title: "Delete",
                shortcut: "Shift + Backspace",
                action: () => TabSystem.deleteCurrent()
            }
        ]
    },
    view: {
        trusted: true,
        display_name: "Help",
        elements: [
            {
                title: "About",
                action: () => shell.openExternal("https://www.github.com/solvedDev/bridge.")
            },
            {
                title: "Plugin API",
                action: () => shell.openExternal("https://github.com/solvedDev/bridge./blob/master/plugins/getting-started.md")
            }
        ]
    }
}

const mutations = {
    /**
     * Data format:
     * id = key inside state
     * display_name = name to display
     * elements = elements to show in menu
     */
    addToAppMenu(state, data) {
        let menu = {
            display_name: data.display_name,
            elements: data.elements,
            trusted: data.trusted != undefined ? data.trusted : true
        };
        Vue.set(state, data.id, menu);

        KeyManager.bind(data.elements, menu);
    },

    removeFromAppMenu(state, data) {
        Vue.delete(state, data.id);
        KeyManager.unbind(data.elements);
    }
}

export default {
    state,
    mutations
}