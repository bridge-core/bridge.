import Runtime from "./Runtime";
import { shell } from "electron";
import fs from "fs";
import path from "path";
import Store from "../../store/index";
import { trigger, overwriteTrigger } from "./EventTriggers";
import PluginAssert from "./PluginAssert";
import TabSystem from "../TabSystem";
import FileSystem from "../FileSystem";
import { BASE_PATH } from "../constants";
import JSONTree from "../editor/JsonTree";

export default class Bridge {
    constructor(is_module, file_path) {
        this.plugin_id = Runtime.Plugins.getRuntimeId();
        
        this.__file_path__ = file_path;
        if(is_module) {
            Runtime.Plugins.add(this.plugin_id, "module");
        } else {
            Runtime.Plugins.add(this.plugin_id, "unknown");
        }

        this.Cache = {
            open(path, cb) {
                FileSystem.Cache.get(path)
                    .then(data => {
                        if(typeof cb == "function") cb(data);
                    })
                    .catch(err => cb({}));
            },
            openSync(path) {
                let c =  FileSystem.Cache;
                return c.openWith(c.cached_cache, path) || c.openWith(c.getCacheSync(), path);
            },
            write(path, other) {
                FileSystem.Cache.save(path, undefined, other);
            },
            Dependency: {
                add(to, dependency, cb) {
                    FileSystem.Cache.addDependency(to, dependency)
                        .then(cache => cb(cache));
                },
                remove(from, dependency) {
                    FileSystem.Cache.removeDependency(from, dependency);
                },
                removeAll(sources=[], dependency) {
                    if(!Array.isArray(sources)) sources = Array.prototype.slice.call({ ...sources, length: Object.keys(sources).length });
                    let p =  Store.state.Explorer.project;
                    FileSystem.Cache.removeAllDependencies(sources.map(
                        s => s.includes(p) ? s : BASE_PATH + Store.state.Explorer.project + "/" + s
                    ), dependency);
                }
            }
        };
        this.JSONTree = JSONTree;

        this.Store = {
            namespace: undefined,

            setup(namespace) {
                if(namespace == undefined) throw new Error("You need to define a namespace");
                this.namespace = namespace + "/";
                fs.mkdir(path.join(Runtime.Paths.store(), namespace), (err) => {
                    if(err && !err.message.includes("file already exists")) throw err;
                });
            },
            load(name) {
                if(this.namespace == undefined) throw new Error("You need to define a namespace using Bridge.Store.setup(namespace)");
                return JSON.parse(fs.readFileSync(path.join(Runtime.Paths.store(), this.namespace, name)));
            },
            save(name, data) {
                if(this.namespace == undefined) throw new Error("You need to define a namespace using Bridge.Store.setup(namespace)");
                try {
                    return fs.writeFileSync(path.join(Runtime.Paths.store(), this.namespace, name), JSON.stringify(data));
                } catch(e) {
                    throw new Error("Provided data is not a valid store content.");
                }
            },
            exists(name) {
                if(this.namespace == undefined) throw new Error("You need to define a namespace using Bridge.Store.setup(namespace)");
                return fs.existsSync(path.join(Runtime.Paths.store(), this.namespace, name));
            }
        };

        this.FS = {
            __file_path__: file_path,
            readFile(filePath, cb) {
                fs.readFile(path.join(Runtime.Paths.project(), filePath), (err, data) => {
                    if(err && !cb) PluginAssert.throw(this.__file_path__, err);
                    cb(err, data);
                });
            },
            readFileSync(filePath) {
                try {
                    return fs.readFileSync(path.join(Runtime.Paths.project(), filePath));
                } catch(err) {
                    PluginAssert.throw(this.__file_path__, err);
                }
                
            },
            writeFile(filePath, data, cb, check=true) {
                let folder = path.split(/\\|\//g);
                folder.pop();
                folder = path.join(...folder);

                if(check && !this.exists(Runtime.Paths.project() + folder)) {
                    fs.mkdir(path.join(Runtime.Paths.project(), folder), err => {
                        this.writeFile(filePath, data, cb, false);
                    });
                } else {
                    fs.writeFile(path.join(Runtime.Paths.project(), filePath), data, (err) => {
                        if(err && !cb) PluginAssert.throw(this.__file_path__, err);
                        else if(err) cb(err);
                    });
                }
            },
            readDirectory(filePath, cb) {
                fs.readdir(path.join(Runtime.Paths.project(), filePath), (err, data) => {
                    if(err && !cb) PluginAssert.throw(this.__file_path__, err);
                    cb(err, data);
                });
            },
            exists(filePath) {
                return fs.existsSync(path.join(Runtime.Paths.project() + filePath));
            },
            stats(filePath, cb) {
                fs.lstat(path.join(Runtime.Paths.project(), filePath), (err, data) => {
                    if(err && !cb) PluginAssert.throw(this.__file_path__, err);
                    cb(err, data);
                });
            }
        };
        this.Language = {
            register(name, language) {
                if(!Runtime.HL.exists(name)) {
                    //hljs.registerLanguage(name, language);
                    Runtime.HL.add(name, language);
                }
            },
            remove(name) {
                if(Runtime.HL.exists(name)) {
                    //hljs.unregisterLanguage(name);
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
        this.Highlighter = {
            registerLanguage() {
                throw new Error("Using Highlighter.registerLanguage(...) is deprecated.");
            },
            unregisterLanguage() {
                throw new Error("Using Highlighter.unregisterLanguage(...) is deprecated.");
            }
        };

        this.Menu = {
            register: (menu_input) => {
                Runtime.Menus.add(this.plugin_id, { ...menu_input, trusted: false });      
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

        this.Utils = {
            get base_path() {
                return path.join(BASE_PATH, Store.state.Explorer.project) + "/";
            },
            get current_project() {
                return Store.state.Explorer.project;
            },
            get current_selected() {
                return TabSystem.getCurrentNavObj();
            },
            get current_file_path() {
                return TabSystem.getSelected().file_path.replace(/\\/g, "/");
            },
            get current_file_content() {
                return TabSystem.getSelected().content;
            }
        };
    }

    registerPlugin(plugin_info) {
        Runtime.Plugins.add(this.plugin_id, { ...plugin_info, id: this.__file_path__ });
    }
    

    on(event, cb) {
        Runtime.Listeners.add(event, cb);
    }
    off(event, cb) {
        if(!cb) PluginAssert.throw("You need to define a callback in order to remove an event listener.");
        Runtime.Listeners.remove(event, cb);
    }
    trigger(name, arg, basic=false) {
        if(basic) {
            return overwriteTrigger(name, arg);
        } else {
            return trigger(name, arg);
        }
    }
    open({ content, file_name, file_path }) {
        TabSystem.add({
            content,
            raw_content: content,
            file_path: path.join(Runtime.Project.get(), file_path),
            file_name
        });
    }
    openExternal(path) {
        shell.openExternal(path);
    }
}