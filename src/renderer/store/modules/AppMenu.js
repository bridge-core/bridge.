import KeyManager from "../../scripts/appMenu/KeyManager";
import Vue from "vue";
import Store from "../index";
import { ipcRenderer, shell } from "electron";
import SettingsWindow from "../../windows/Settings";
import CreateFileWindow from "../../windows/CreateFile";
import TabSystem from "../../scripts/TabSystem";
import Cache from "../../scripts/utilities/Cache";
import FileSystem from "../../scripts/FileSystem";
import ConfirmWindow from "../../scripts/commonWindows/Confirm";
import EventBus from "../../scripts/EventBus";

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
                title: "Clear Cache",
                action: () => {
                    if(TabSystem.getSelected()) new ConfirmWindow(() => {
                        try {
                            let path = TabSystem.getSelected().file_path;
                            FileSystem.Cache.clear(path);
                            TabSystem.closeSelected();
                            FileSystem.open(path);
                        } catch(err) {}
                    }, null, {
                        options: {
                            is_frameless: true,
                            height: 120
                        },
                        content: [
                            {
                                type: "header",
                                text: "Confirmation"
                            },
                            {
                                type: "divider"
                            },
                            {
                                text: "\nAre you sure that you want to delete the cache of this file?"
                            }
                        ]
                    });
                } 
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
                type: "submenu",
                title: "Selection",
                elements: [
                    {
                        title: "Unselect",
                        shortcut: "Escape",
                        action: () => TabSystem.setCurrentFileNav("global")
                    },
                    {
                        title: "Select Next",
                        shortcut: "Ctrl + D",
                        action: () => TabSystem.moveSelectionDown()
                    },
                    {
                        title: "Select Previous",
                        shortcut: "Ctrl + E",
                        action: () => TabSystem.moveSelectionUp()
                    }
                ]
            },
            {
                type: "submenu",
                title: "JSON Nodes",
                elements: [
                    {
                        title: "Move Node Up",
                        shortcut: "Ctrl + T",
                        action: () => TabSystem.moveCurrentUp()
                    },
                    {
                        title: "Move Node Down",
                        shortcut: "Ctrl + G",
                        action: () => TabSystem.moveCurrentDown()
                    },
                    {
                        title: "Open All Nodes",
                        shortcut: "Ctrl + J",
                        action: () => EventBus.trigger("openAllNodes")
                    },
                    {
                        title: "Close All Nodes",
                        shortcut: "Ctrl + U",
                        action: () => EventBus.trigger("closeAllNodes")
                    }
                ]
            },
            {
                type: "divider"
            },
            {
                title: "Delete",
                shortcut: "Ctrl + Backspace",
                action: () => TabSystem.deleteCurrent()
            },
            {
                shortcut: "Ctrl + Del",
                action: () => TabSystem.deleteCurrent(),
                is_hidden: true
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