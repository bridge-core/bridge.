import Runtime from "./Runtime";
import { shell } from "electron";
import fs from "fs";
import Store from "../../store/index";
import { trigger, overwriteTrigger } from "./EventTriggers";
import PluginAssert from "./PluginAssert";
import TabSystem from "../TabSystem";

export default class Bridge {
    constructor(is_module, file_path) {
        this.plugin_id = Runtime.Plugins.getRuntimeId();
        
        this.__file_path__ = file_path;
        if(is_module) {
            Runtime.Plugins.add(this.plugin_id, "module");
        } else {
            Runtime.Plugins.add(this.plugin_id, "unknown");
        }

        this.Store = {
            namespace: undefined,

            setup(namespace) {
                if(namespace == undefined) throw new Error("You need to define a namespace");
                this.namespace = namespace + "/";
                fs.mkdir(Runtime.Paths.store() + namespace, (err) => {
                    if(err && !err.message.includes("file already exists")) throw err;
                });
            },
            load(name) {
                if(this.namespace == undefined) throw new Error("You need to define a namespace using Bridge.Store.setup(namespace)");
                return JSON.parse(fs.readFileSync(Runtime.Paths.store() + this.namespace + name));
            },
            save(name, data) {
                if(this.namespace == undefined) throw new Error("You need to define a namespace using Bridge.Store.setup(namespace)");
                try {
                    return fs.writeFileSync(Runtime.Paths.store() + this.namespace + name, JSON.stringify(data));
                } catch(e) {
                    throw new Error("Provided data is not a valid store content.");
                }
            },
            exists(name) {
                if(this.namespace == undefined) throw new Error("You need to define a namespace using Bridge.Store.setup(namespace)");
                return fs.existsSync(Runtime.Paths.store() + this.namespace + name);
            }
        };

        this.FS = {
            __file_path__: file_path,
            readFile(path, cb) {
                return fs.readFile(Runtime.Paths.project() + path, (err, data) => {
                    if(err) PluginAssert.throw(this.__file_path__, err)
                    cb(err, data);
                });
            },
            readDirectory(path, cb) {
                return fs.readdir(Runtime.Paths.project() + path, (err, data) => {
                    if(err) PluginAssert.throw(this.__file_path__, err)
                    cb(err, data);
                });
            },
            exists(path) {
                return fs.existsSync(Runtime.Paths.project() + path);
            },
            stats(path, cb) {
                return fs.lstat(Runtime.Paths.project() + path, (err, data) => {
                    if(err) PluginAssert.throw(this.__file_path__, err)
                    cb(err, data);
                });
            }
        };

        this.Highlighter = {
            registerLanguage(name, language) {
                if(!Runtime.HL.exists(name)) {
                    hljs.registerLanguage(name, language);
                    Runtime.HL.add(name, language);
                }
            },
            unregisterLanguage(name) {
                if(Runtime.HL.exists(name)) {
                    hljs.unregisterLanguage(name);
                    Runtime.HL.remove(name);
                }
            },

            addKeywords(keywords) {
                Store.commit("addPluginKeywords", keywords);
            },
            addTitles(titles) {
                Store.commit("addPluginTitles", titles);
            },
            addSymbols(symbols) {
                Store.commit("addPluginSymbols", symbols);
            }
        };

        this.Menu = {
            register: (menu_input) => {
                Runtime.Menus.add(this.plugin_id, { ...menu_input, trusted: false });
                console.log(Runtime.Menus.get(this.plugin_id));
                
                Store.commit("addToAppMenu", Runtime.Menus.get(this.plugin_id));
            }
        };

        this.Sidebar = {
            register(sidebar_input) {
                if(Array.isArray(sidebar_input)) {
                    Runtime.Sidebar.add(...sidebar_input);
                    sidebar_input.forEach(input => Store.commit("addPluginSidebar", input));
                } else {
                    Runtime.Sidebar.add(sidebar_input);
                    Store.commit("addPluginSidebar", sidebar_input);
                }
            },
            update(sidebar) {
                Store.commit("updatePluginSidebar", sidebar);
            },
            remove(id) {
                Store.commit("removePluginSidebar", id);
            },
            open(id) {
                Store.commit("openPluginSidebar", id);
            },
            openDefault() {
                Store.commit("setSidebarMenu", 1);
            },
            close() {
                Store.commit("setSidebarMenu", 0);
            }
        };

        this.Footer = {
            register(footer_element) {
                if(footer_element.id == undefined) throw new Error("No footer id defined.");
                Store.commit("addPluginFooter", footer_element);
            },
            update(footer_element) {
                Store.commit("updatePluginFooter", footer_element);
            },
            remove(id) {
                Store.commit("removePluginFooter", id);
            }
        };

        this.Window = {
            register(window) {
                if(window.id == undefined) throw new Error("No window id defined.");
                Store.commit("addPluginWindow", window);
            },
            update(window) {
                Store.commit("updatePluginWindow", window);
            },
            open(id) {
                Store.commit("setWindowIsVisible", {
                    id,
                    val: true
                });
            },
            close(id) {
                Store.commit("setWindowIsVisible", {
                    id,
                    val: false
                });
            },
            remove(id) {
                Store.commit("removePluginWindow", id);
            }
        };

        this.BuildableFile = {
            register(file) {
                Runtime.CreationWindow.add(file);
            }
        };
    }

    registerPlugin(plugin_info) {
        Runtime.Plugins.add(this.plugin_id, { ...plugin_info, id: this.__file_path__ });
    }
    

    on(event, cb) {
        Runtime.Listeners.add(event, cb);
    }
    trigger(name, arg, basic=false) {
        if(basic) {
            return overwriteTrigger(name, arg);
        } else {
            return trigger(name, arg);
        }
    }
    open({ content, file_name, path }) {
        TabSystem.add({
            content,
            raw_content: content,
            path: Runtime.Project.get() + "/" + path,
            file_name
        });
    }
    openExternal(path) {
        shell.openExternal(path);
    }
}