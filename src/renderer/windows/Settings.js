import TabWindow from "../scripts/commonWindows/TabWindow";
import Store from "../store/index";
import SETTINGS from "../store/Settings";
import { MINECRAFT_VERSIONS, BASE_PATH } from "../scripts/constants";
import EventBus from "../scripts/EventBus";
import fs from "fs";

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
                })
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
                new ReactiveSwitch(this, "is_dev_mode", {
                    color: "error",
                    text: "Asserts",
                    key: `settings.dev.tab.${Math.random()}`
                })
            ]
        });

        this.update();
    }

    save() {
        Store.commit("setSettings", this.data);
        SETTINGS.save(this.data);
    }
}