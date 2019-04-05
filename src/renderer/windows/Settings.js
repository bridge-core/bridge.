import TabWindow from "../scripts/commonWindows/TabWindow";
import Store from "../store/index";
import SETTINGS from "../store/Settings";
import { MINECRAFT_VERSIONS, BASE_PATH } from "../scripts/constants";
import EventBus from "../scripts/EventBus";
import fs from "fs";
import AddSnippetWindow from "./AddSnippet";
import Snippets from "./Snippets";
import ProblemIterator from "../scripts/editor/problems/Problems";
import { ipcRenderer } from "electron";

class ReactiveListEntry {
    constructor(text, parent, watch_key, index) {
        this.type = "card";
        this.below_content = [
            {
                text: text
            },
            {
                type: "space"
            },
            {
                type: "icon-button",
                text: "mdi-delete",
                color: "error",
                only_icon: true,
                action: () => {
                    Snippets.removeSnippet(parent.data[watch_key][index]);
                    parent.save({
                        [watch_key]: parent.data[watch_key].filter((e, i) => index !== i)
                    });
                    parent.select(undefined, true);
                }
            }
        ]
    }
}
class ReactiveList {
    constructor(parent, watch_key) {
        this.parent = parent;
        this.watch_key = watch_key;
    }
    get content() {
        let arr = this.parent.data[this.watch_key];
        let res = [];
        for(let i = 0; i < arr.length; i++) {
            res.push(new ReactiveListEntry(arr[i].display_name, this.parent, this.watch_key, i));
            res.push({ text: "\n" });
        }
        return res;
    }
    get() {
        return {
            type: "container",
            content: this.content
        };
    }
}

class ReactiveSwitch {
    constructor(parent, watch_key, def) {
        this.type = "switch";
        this.input = parent.data[watch_key];
        for(let key in def) {
            this[key] = def[key];
        }

        this.action = (val) => {
            this.input = val;
            parent.data[watch_key] = val;
            parent.save();
        };
    }
}

class ReactiveInput {
    constructor(parent, watch_key, def) {
        this.type = "input";
        this.input = parent.data[watch_key];
        for(let key in def) {
            this[key] = def[key];
        }

        this.action = (val) => {
            this.input = val;
            parent.data[watch_key] = val;
            parent.save();
        };
    }
}

class ReactiveDropdown {
    constructor(parent, watch_key, options, def, cb) {
        this.type = "select";
        this.input = parent.data[watch_key];
        this.options = options;
        for(let key in def) {
            this[key] = def[key];
        }

        this.action = (val) => {
            this.input = val;
            parent.data[watch_key] = val;
            parent.save();
            if(typeof cb == "function") cb(val);
        };
    }
}

export default class SettingsWindow extends TabWindow {
    constructor() {     
        super("Settings", { is_persistent: false }, "bridge.core.settings_window.");
        this.data = SETTINGS.load();
        const PROJECTS = fs.readdirSync(BASE_PATH);

        this.addTab({
            sidebar_element: {
                icon: "mdi-code-braces",
                title: "Editor"
            },
            content: [
                {
                    color: "grey",
                    text: "\nTarget Minecraft Version"
                },
                new ReactiveDropdown(this, "target_version", MINECRAFT_VERSIONS, {
                    text: "Choose a version...",
                    key: `settings.editor.tab.target_version.${Math.random()}`
                }, () => EventBus.trigger("updateAutoCompletions")),

                {
                    color: "grey",
                    text: "\nGeneral"
                },
                new ReactiveSwitch(this, "use_tabs", {
                    color: "light-green",
                    text: "Use Tabs",
                    key: `settings.editor.tab.tabs.${Math.random()}`
                }),
                new ReactiveSwitch(this, "line_wraps", {
                    color: "light-green",
                    text: "Word Wrap",
                    key: `settings.editor.tab.line_wraps.${Math.random()}`
                }),
                new ReactiveSwitch(this, "open_all_nodes", {
                    color: "light-green",
                    text: "Open All Nodes",
                    key: `settings.editor.tab.open_all_nodes.${Math.random()}`
                }),

                {
                    color: "grey",
                    text: "\nAuto-Completions"
                },
                new ReactiveSwitch(this, "auto_completions", {
                    color: "light-green",
                    text: "Provide Auto-Completions",
                    key: `settings.editor.tab.auto_completions.${Math.random()}`
                }),
                new ReactiveSwitch(this, "auto_fill_inputs", {
                    color: "light-green",
                    text: "Auto Fill Inputs",
                    key: `settings.editor.tab.auto_fill_inputs.${Math.random()}`
                }),

                {
                    color: "grey",
                    text: "\nError Detection"
                },
                new ReactiveDropdown(this, "when_error", [ "On Save", "On File Change", "Never" ], {
                    text: "Choose when to search for errors...",
                    key: `settings.editor.tab.when_error.${Math.random()}`
                }, () => ProblemIterator.repeatLast()),
                new ReactiveSwitch(this, "error_icon_indicator", {
                    color: "light-green",
                    text: "Error Icon Indicator",
                    key: `settings.editor.tab.error_icon_indicator.${Math.random()}`
                }),
                new ReactiveSwitch(this, "error_auto_fix", {
                    color: "light-green",
                    text: "Error Auto-fix",
                    key: `settings.editor.tab.error_auto_fix.${Math.random()}`
                })
            ]
        });
        this.addTab({
            sidebar_element: {
                icon: "mdi-attachment",
                title: "Snippets"
            },
            content: [
                {
                    color: "grey",
                    text: "\nInsertion Scope"
                },
                new ReactiveDropdown(this, "snippet_scope", [ "Default", "Selected Node"], {
                    text: "Choose a scope...",
                    key: `settings.editor.tab.snippet_scope.${Math.random()}`
                }),
                {
                    color: "grey",
                    text: "\nCustom Snippets\n"
                },
                {
                    type: "icon-button",
                    color: "success",
                    text: "mdi-plus",
                    only_icon: true,
                    action: () => new AddSnippetWindow(this)
                },
                {
                    type: "divider"
                },
                {
                    text: "\n"
                },
                () => new ReactiveList(this, "custom_snippets").get()
            ]
        });
        this.addTab({
            sidebar_element: {
                icon: "mdi-folder-multiple",
                title: "Explorer"
            },
            content: [
                {
                    color: "grey",
                    text: "\nDefault Project"
                },
                new ReactiveDropdown(this, "default_project", PROJECTS, {
                    text: "Choose a default project...",
                    key: `settings.editor.tab.default_project.${Math.random()}`
                })
            ]
        });
        this.addTab({
            sidebar_element: {
                icon: "mdi-flower-tulip",
                title: "Appearance"
            },
            content: [
                new ReactiveSwitch(this, "is_dark_mode", {
                    color: "light-green",
                    text: "Dark Mode",
                    key: `settings.appearance.tab.${Math.random()}`
                }),
                new ReactiveSwitch(this, "inversed_arrows", {
                    color: "light-green",
                    text: "Inverse Arrows",
                    key: `settings.editor.tab.arrows.${Math.random()}`
                })
            ]
        });
        this.addTab({
            sidebar_element: {
                icon: "mdi-cogs",
                title: "Developer Mode"
            },
            content: [
                {
                    type: "button",
                    text: "Toggle Dev Tools",
                    color: "warning",
                    is_rounded: true,
                    action: () => ipcRenderer.send("toggleDevTools")
                },
                new ReactiveSwitch(this, "is_dev_mode", {
                    color: "error",
                    text: "Asserts",
                    key: `settings.dev.tab.${Math.random()}`
                })                
            ]
        });

        this.update();
    }

    save(data=this.data) {
        Store.commit("setSettings", data);
        SETTINGS.save(data);
    }
}