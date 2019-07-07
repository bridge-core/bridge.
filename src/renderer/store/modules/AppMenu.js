import KeyManager from "../../scripts/appMenu/KeyManager";
import Vue from "vue";
import Store from "../index";
import { ipcRenderer, shell } from "electron";
import SettingsWindow from "../../windows/Settings";
import CreateFileWindow from "../../windows/CreateFile";
import TabSystem from "../../scripts/TabSystem";
import FileSystem from "../../scripts/FileSystem";
import ConfirmWindow from "../../scripts/commonWindows/Confirm";
import EventBus from "../../scripts/EventBus";
import SnippetWindow from "../../windows/Snippets";
import TemplateSetsWindow from "../../windows/TemplateSets";
import CreditsWindow from "../../windows/Credits";
import NodeShortcuts from "../../scripts/editor/Shortcuts";
import OmegaCache from "../../scripts/editor/OmegaCache";
import LightningCache from "../../scripts/editor/LightningCache";

const state = {
    file: {
        trusted: true,
        display_name: "File",
        elements: [
            {
                title: "New File",
                shortcut: "Ctrl + N",
                action: () => new CreateFileWindow(undefined, false)
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
                            OmegaCache.clear(path);
                            LightningCache.clear(path);
                            TabSystem.closeSelected();
                            FileSystem.open(path);
                        } catch(err) {}
                    }, null, "Are you sure that you want to delete the cache of this file?");
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
                        title: "Toggle Open",
                        shortcut: "Ctrl + Enter",
                        action: () => TabSystem.toggleCurrentNode()
                    },
                    {
                        title: "Toggle Open Children",
                        shortcut: "Ctrl + Shift + Enter",
                        action: () => {
                            TabSystem.getCurrentNavObj().toggleOpenDeep();
                        }
                    },
                    {
                        type: "divider"
                    },
                    {
                        title: "Move Up",
                        shortcut: "Ctrl + Shift + E",
                        action: () => TabSystem.moveCurrentUp()
                    },
                    {
                        title: "Move Down",
                        shortcut: "Ctrl + Shift + D",
                        action: () => TabSystem.moveCurrentDown()
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
            },
            {
                type: "divider"
            },
            {
                title: "Undo",
                shortcut: "Ctrl + Z",
                action: () => {
                    if(!TabSystem.getHistory().undo()) EventBus.trigger("cmUndo");
                }
            },
            {
                title: "Redo",
                shortcut: "Ctrl + Y",
                action: () => {
                    if(!TabSystem.getHistory().redo()) EventBus.trigger("cmRedo");
                }
            },
            {
                type: "divider"
            },
            {
                title: "Copy",
                shortcut: "Ctrl + C",
                action: () => {
                    if(document.activeElement.tagName === "BODY" || window.getSelection().toString() == "") {
                        NodeShortcuts.copy();
                    } else {
                        document.execCommand("copy");
                    }
                }
            },
            {
                title: "Cut",
                shortcut: "Ctrl + X",
                action: () => {
                    if(document.activeElement.tagName === "BODY"  || window.getSelection().toString() == "") {
                        NodeShortcuts.cut();
                    } else {
                        document.execCommand("cut");
                    }
                }
            },
            {
                title: "Paste",
                shortcut: "Ctrl + V",
                action: () => {
                    if(document.activeElement.tagName === "BODY") {
                        NodeShortcuts.paste();
                    } else {
                        document.execCommand("paste");
                    }
                }
            }            
        ]
    },
    tools: {
        trusted: true,
        display_name: "Tools",
        elements: [
            {
                title: "Snippets",
                shortcut: "Ctrl + Q",
                action: () => SnippetWindow.show()
            },
            {
                title: "Template Sets",
                shortcut: "Ctrl + T",
                action: () => TemplateSetsWindow.show()
            }
        ]
    },
    help: {
        trusted: true,
        display_name: "Help",
        elements: [
            {
                title: "About",
                action: () => new CreditsWindow()
            },
            {
                title: "Latest Release",
                action: () => shell.openExternal("https://github.com/solvedDev/bridge./releases/latest")
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