import TabWindow from "../scripts/commonWindows/TabWindow";
import Store from "../store/index";
import SETTINGS from "../store/Settings";
import { MINECRAFT_VERSIONS, BASE_PATH, MOJANG_PATH } from "../scripts/constants";
import EventBus from "../scripts/EventBus";
import fs from "fs";
import AddSnippetWindow from "./AddSnippet";
import Snippets from "./Snippets";
import ProblemIterator from "../scripts/editor/problems/Problems";
import { ipcRenderer } from "electron";
import ConfirmWindow from "../scripts/commonWindows/Confirm";
import ThemeManager from "../scripts/editor/ThemeManager";
import ProjectConfig from "../scripts/ProjectConfig";
import { uuid } from "../scripts/utilities/useAttr";

class ReactiveListEntry {
    type = "card";
    below_content: any[];

    constructor(text: string, parent: SettingsWindow, watch_key: string, index: number) {
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
                        [watch_key]: parent.data[watch_key].filter((_: any, i: number) => index !== i)
                    });
                    parent.select(undefined, true);
                }
            }
        ]
    }
}
class ReactiveList {
    parent: SettingsWindow;
    watch_key: string;

    constructor(parent: SettingsWindow, watch_key: string) {
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
    type = "switch";
    [x: string]: any;

    constructor(parent: SettingsWindow, watch_key: string, def: any) {
        this.input = parent.data[watch_key];
        for(let key in def) {
            this[key] = def[key];
        }

        this.action = (val: boolean) => {
            this.input = val;
            parent.data[watch_key] = val;
            parent.save();
        };
    }
}

class ReactiveInput {
    type = "input";
    [x: string]: any;

    constructor(parent: SettingsWindow, watch_key: string, def: any) {
        this.input = parent.data[watch_key];
        for(let key in def) {
            this[key] = def[key];
        }

        this.action = (val: string) => {
            this.input = val;
            parent.data[watch_key] = val;
            parent.save();
        };
    }
}

class ReactiveDropdown {
    type: "autocomplete" | "select";
    [x: string]: any;

    constructor(parent: SettingsWindow, watch_key: string, options: string[], def: any, cb?: (a: string) => any) {
        this.type = options.length > 5 ? "autocomplete" : "select";
        this.input = parent.data[watch_key];
        this.options = options;
        this.is_box = true;
        for(let key in def) {
            this[key] = def[key];
        }

        this.action = (val: string) => {
            this.input = val;
            parent.data[watch_key] = val;
            parent.save();
            if(typeof cb == "function") cb(val);
        };
    }
}

export default class SettingsWindow extends TabWindow {
    data: any;

    constructor() {     
        super("Settings", { is_persistent: false }, "bridge.core.settings_window.");
        this.data = SETTINGS.load();
        let PROJECTS: string[] = [];
        try {
            PROJECTS = fs.readdirSync(BASE_PATH);
        } catch(e) {}

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
                    text: "\nExperimental"
                },
                new ReactiveSwitch(this, "bridge_predictions", {
                    color: "primary",
                    text: "bridge. Predictions",
                    key: `settings.editor.tab.bridge_predictions.${Math.random()}`
                }),
                {
                    color: "grey lighten-1",
                    text: "This experimental feature changes the classic way of editing JSON to a different approach with only two inputs. \"bridge.\" will try to predict the node type you want to insert.\n"
                },

                {
                    color: "grey",
                    text: "\nGeneral"
                },
                new ReactiveSwitch(this, "use_tabs", {
                    color: "primary",
                    text: "Use Tabs",
                    key: `settings.editor.tab.tabs.${Math.random()}`
                }),
                new ReactiveSwitch(this, "line_wraps", {
                    color: "primary",
                    text: "Word Wrap",
                    key: `settings.editor.tab.line_wraps.${Math.random()}`
                }),
                new ReactiveSwitch(this, "disable_node_dragging", {
                    color: "primary",
                    text: "Disable Node Dragging",
                    key: `settings.editor.tab.disable_node_dragging.${Math.random()}`
                }),
                new ReactiveSwitch(this, "focus_json_inputs", {
                    color: "primary",
                    text: "Auto-Focus Inputs",
                    key: `settings.editor.tab.focus_json_inputs.${Math.random()}`
                }),
                new ReactiveSwitch(this, "auto_scroll_json", {
                    color: "primary",
                    text: "Auto-Scroll",
                    key: `settings.editor.tab.focus_json_inputs.${Math.random()}`
                }),
                new ReactiveSwitch(this, "cade_node_click", {
                    color: "primary",
                    text: "Only Select Node On Click",
                    key: `settings.editor.tab.cade_node_click.${Math.random()}`
                }),
                new ReactiveSwitch(this, "open_all_nodes", {
                    color: "primary",
                    text: "Open All Nodes",
                    key: `settings.editor.tab.open_all_nodes.${Math.random()}`
                }),

                {
                    color: "grey",
                    text: "\nAuto-Completions"
                },
                new ReactiveSwitch(this, "auto_completions", {
                    color: "primary",
                    text: "Provide Auto-Completions",
                    key: `settings.editor.tab.auto_completions.${Math.random()}`
                }),
                new ReactiveSwitch(this, "text_auto_completions", {
                    color: "primary",
                    text: "Provide Text Auto-Completions",
                    key: `settings.editor.tab.text_auto_completions.${Math.random()}`
                }),
                new ReactiveSwitch(this, "auto_fill_inputs", {
                    color: "primary",
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
                    color: "primary",
                    text: "Error Icon Indicator",
                    key: `settings.editor.tab.error_icon_indicator.${Math.random()}`
                }),
                new ReactiveSwitch(this, "error_auto_fix", {
                    color: "primary",
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
                    color: "primary",
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
                    text: "\nChosen Default Directory:\n"
                },
                {
                    text: MOJANG_PATH + "\n",
                    color: "grey"
                },
                {
                    type: "button",
                    text: "Default Directory",
                    color: "error",
                    is_rounded: false,
                    action: () => {
                        new ConfirmWindow(() => {
                            ipcRenderer.send("chooseDefaultDirectory");
                        }, () => {}, "Setting a new default directory requires an app restart. Make sure to save your progress first!", {
                            cancel_text: "Cancel",
                            confirm_text: "Continue"
                        })
                    }
                },
                {
                    color: "grey",
                    text: "\n\nDefault Project"
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
                {
                    color: "grey",
                    text: "\nTheme"
                },
                {
                    key: uuid(),
                    type: "autocomplete",
                    is_box: true,
                    color: "primary",
                    text: "Choose a theme...",
                    input: ThemeManager.current_theme,
                    options: ThemeManager.theme_names,
                    action: (val: string) => {
                        ThemeManager.applyTheme(val);
                        ProjectConfig.setTheme(val);
                    }
                },
                new ReactiveSwitch(this, "is_dark_mode", {
                    color: "primary",
                    text: "Dark Mode",
                    key: `settings.appearance.tab.${Math.random()}`
                }),
                new ReactiveSwitch(this, "inversed_arrows", {
                    color: "primary",
                    text: "Inverse Arrows",
                    key: `settings.appearance.tab.arrows.${Math.random()}`
                }),
                new ReactiveSwitch(this, "hide_data_next_to_nodes", {
                    color: "primary",
                    text: "Hide Data Next To Nodes",
                    key: `settings.appearance.tab.hide_data_next_to_nodes.${Math.random()}`
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
                    text: "\n"
                },
                {
                    type: "button",
                    text: "Toggle Dev Tools",
                    color: "warning",
                    is_rounded: false,
                    action: () => ipcRenderer.send("toggleDevTools")
                },
                new ReactiveSwitch(this, "is_dev_mode", {
                    color: "error",
                    text: "Error Pop-Up",
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