import KeyManager from "../../scripts/AppMenu/KeyManager";
import Vue from "vue";
import { ipcRenderer, shell } from "electron";
import SettingsWindow from "../../windows/Settings";
import CreateFileWindow from "../../windows/CreateFile";
import TabSystem from "../../scripts/TabSystem";
import EventBus from "../../scripts/EventBus";
import SnippetWindow from "../../windows/Snippets";
import AboutWindow from "../../windows/About";
import NodeShortcuts from "../../scripts/editor/NodeShortcuts";
import ExtensionBrowser from "../../windows/Extensions/Browser";
import Store from "../index";
import InformationWindow from "../../scripts/commonWindows/Information";
import GoToFileWindow from "../../windows/GoToFileWindow";
import { getMenu } from "../../scripts/Presets";
import PresetWindow from "../../windows/PresetWindow";

const state = {
    file: {
        trusted: true,
        display_name: "File",
        elements: [
            {
                title: "New File",
                shortcut: "Ctrl + N",
                action: () => {
                    if(Store.state.Explorer.project.explorer)
                        new CreateFileWindow(undefined, false);
                    else
                        new InformationWindow("Information", "You need to create a project before you can create files.");
                }
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
                title: "Save All",
                shortcut: "Ctrl + Alt + S",
                action: () => TabSystem.saveAll()
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
                        action: () => new ExtensionBrowser()
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
                        title: "Select Parent",
                        shortcut: "Ctrl + P",
                        action: () => {
                            let p = TabSystem.getCurrentNavObj().parent;
                            if(p !== undefined) TabSystem.setCurrentFileNav(p.path);
                        }
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
                    },
                    {
                        title: "Comment/Uncomment",
                        shortcut: "Ctrl + I",
                        action: () => {
                            try { 
                                TabSystem.getCurrentNavObj().toggleIsActive();
                                TabSystem.setCurrentUnsaved();
                            } catch {}
                        }
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
                    if(!NodeShortcuts.execPaste()) {
                        document.execCommand("paste");
                    }
                }
            },
            {
                title: "Alternative Paste",
                shortcut: "Ctrl + Shift + V",
                action: () => {
                    if(!NodeShortcuts.execPaste(true)) {
                        document.execCommand("paste");
                    }
                }
            } 
        ]
    },
    presets: {
        trusted: true,
        display_name: "Presets",
        action: () => new PresetWindow()
    },
    tools: {
        trusted: true,
        display_name: "Tools",
        elements: [
            {
                title: "Go to File",
                shortcut: "Ctrl + Shift + O",
                action: () => GoToFileWindow.show()
            },
            {
                title: "Snippets",
                shortcut: "Ctrl + Q",
                action: () => SnippetWindow.show()
            },
            // {
            //     title: "Template Sets",
            //     shortcut: "Ctrl + T",
            //     action: () => TemplateSetsWindow.show()
            // }
        ]
    },
    help: {
        trusted: true,
        display_name: "Help",
        elements: [
            {
                title: "About",
                action: () => new AboutWindow()
            },
            {
                title: "Latest Release",
                action: () => shell.openExternal("https://github.com/solvedDev/bridge./releases/latest")
            },
            {
                title: "Bug Report",
                action: () => shell.openExternal("https://github.com/solvedDev/bridge./issues/new/choose")
            },
            {
                title: "Plugin API",
                action: () => shell.openExternal("https://github.com/solvedDev/bridge./blob/master/plugin_docs/main.md")
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