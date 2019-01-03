import saveEval from "safe-eval";
import fs from "fs";
import Store from "../../store/index";
import hljs from "../editor/hljs";

let Runtime = {
    static_base_path: `C:/Users/${process.env.USERNAME}/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/development_behavior_packs/`,
    getBridgePath() {
        return `${Runtime.static_base_path}${Runtime.project}/bridge/`;
    },
    getStorePath() {
        return `${Runtime.static_base_path}${Runtime.project}/bridge/plugin_storage/`;
    },
    getProjectPath() {
        return `${Runtime.static_base_path}${Runtime.project}/`;
    },
    listeners: {},
    plugins: [],
    menus: [],
    sidebar: [],
    plugin_modules: {},
    hljs_languages: []
};

function reset() {
    Runtime = Object.assign(Runtime, {
        listeners: { },
        plugins: [],
        menus: [],
        sidebar: [],
        plugin_modules: {},
        hljs_languages: []
    });
}
function trigger(name, arg) {
    if(Runtime.listeners[name]) {
        let new_arg = arg;
        Runtime.listeners[name].forEach(cb => {
            let res = cb(new_arg);

            if(res) {
                try {
                    new_arg = Object.assign(arg, res);
                } catch (e) {
                    console.warn(e);
                }
            }
        });
        return new_arg;
    }
    return arg;
}
function overwriteTrigger(name, arg) {
    let new_arg = arg;
    if(Runtime.listeners[name]) {
        let cb = Runtime.listeners[name][Runtime.listeners[name].length -1];
        new_arg = cb(new_arg);
    }
    return new_arg;
}
function readonlyTrigger(name, arg) {
    if(Runtime.listeners[name]) {
        return Runtime.listeners[name][Runtime.listeners[name].length -1](arg);
    }
}

class BlockedBridge {
    constructor(is_module, file_path) {
        this.plugin_id = Runtime.plugins.length;
        this.__file_path__ = file_path;
        if(is_module) {
            Runtime.plugins[this.plugin_id] = "module";
        } else {
            Runtime.plugins[this.plugin_id] = "unknown";
        }

        this.Store = {
            namespace: undefined,
            setup() {},
            load() { },
            save() {},
            exists() {}
        };
        this.FS = {
            readFile() {},
            readDirectory() {},
            exists() {},
            stats() {}
       };
        this.Highlighter = {
            registerLanguage() {},
            unregisterLanguage() {},
            addKeywords() {},
            addTitles() {},
            addSymbols() { }
        };

        this.Menu = {
            register() {}
        };

        this.Sidebar = {
            register() {},
            update() {},
            remove() {},
            open() {},
            openDefault() {},
            close() {}
        };
        this.Footer = {
            register() {},
            update() {},
            remove() {}
        };
        this.Window = {
            register() {},
            update() {},
            remove() {},
            open() {},
            close() {}
        };
    }

    registerPlugin(plugin_info) {
        Runtime.plugins[this.plugin_id] = { ...plugin_info, id: this.__file_path__ };
    }
    on() {}
    trigger() {}
    call() {}
}
class Bridge {
    constructor(is_module, file_path) {
        this.plugin_id = Runtime.plugins.length;
        this.__file_path__ = file_path;
        if(is_module) {
            Runtime.plugins[this.plugin_id] = "module";
        } else {
            Runtime.plugins[this.plugin_id] = "unknown";
        }

        this.Store = {
            namespace: undefined,

            setup(namespace) {
                if(namespace == undefined) throw new Error("You need to define a namespace");
                this.namespace = namespace + "/";
                fs.mkdir(Runtime.getStorePath() + namespace, (err) => {
                    if(err && !err.message.includes("file already exists")) throw err;
                });
            },
            load(name) {
                if(this.namespace == undefined) throw new Error("You need to define a namespace using Bridge.Store.setup(namespace)");
                return JSON.parse(fs.readFileSync(Runtime.getStorePath() + this.namespace + name));
            },
            save(name, data) {
                if(this.namespace == undefined) throw new Error("You need to define a namespace using Bridge.Store.setup(namespace)");
                try {
                    return fs.writeFileSync(Runtime.getStorePath() + this.namespace + name, JSON.stringify(data));
                } catch(e) {
                    throw new Error("Provided data is not a valid store content.");
                }
            },
            exists(name) {
                if(this.namespace == undefined) throw new Error("You need to define a namespace using Bridge.Store.setup(namespace)");
                return fs.existsSync(Runtime.getStorePath() + this.namespace + name);
            }
        };

        this.FS = {
            readFile(path, cb) {
                return fs.readFile(Runtime.getProjectPath() + path, cb);
            },
            readDirectory(path, cb) {
                return fs.readdir(Runtime.getProjectPath() + path, cb);
            },
            exists(path) {
                return fs.existsSync(Runtime.getBridgePath() + path);
            },
            stats(path, cb) {
                return fs.lstat(Runtime.getProjectPath() + path, cb)
            }
        };

        this.Highlighter = {
            registerLanguage(name, language) {
                if(!Runtime.hljs_languages.includes(name)) {
                    hljs.registerLanguage(name, language);
                    Runtime.hljs_languages.push(name);
                }
            },
            unregisterLanguage(name) {
                hljs.unregisterLanguage(name);

                let arr = Runtime.hljs_languages;
                if(arr.includes(name)) {
                    arr.splice(arr.indexOf(name), 1);
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
                Runtime.menus[this.plugin_id] = {...menu_input, trusted: false};
                Store.commit("addToAppMenu", Runtime.menus[this.plugin_id]);
            }
        };

        this.Sidebar = {
            register(sidebar_input) {
                if(Array.isArray(sidebar_input)) {
                    Runtime.sidebar.concat(sidebar_input);
                    sidebar_input.forEach(input => Store.commit("addPluginSidebar", input));
                } else {
                    Runtime.sidebar.push(sidebar_input);
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
    }

    registerPlugin(plugin_info) {
        Runtime.plugins[this.plugin_id] = { ...plugin_info, id: this.__file_path__ };
    }
    

    on(event, cb) {
        if(!Runtime.listeners[event]) {
            Runtime.listeners[event] = [cb];
        } else {
            Runtime.listeners[event].push(cb);
        }
    }
    trigger(name, arg, basic=false) {
        if(basic) {
            return overwriteTrigger(name, arg);
        } else {
            return trigger(name, arg);
        }
        
    }
    call() {

    }
}

class Environment {
    constructor(file_path, depth=1000, is_module, blocked) {
        //Internal
        this.__file_path__ = file_path;
        this.__bridge_import_depth__ = depth;
        //Official
        if(blocked) {
            this.Bridge = new BlockedBridge(is_module, file_path);
            this.console = { log() {}, warn() {}, error() {}, dir(){} };
            this.JSON = { parse() {}, stringify() {} };
        } else {
            this.Bridge = new Bridge(is_module, file_path);
            this.console = {
                log: console.log,
                warn: console.warn,
                error: console.error,
                dir: console.dir
            };
            this.JSON = {
                parse: (obj) => saveEval(obj),
                stringify: JSON.stringify
            };
        }

        this.use = (path) => {
            if(this.__bridge_import_depth__ <= 0) {
                throw new Error("Recursion depth too deep. Flatten your project structure and make sure that you haven't created an import loop.");
            }
            
            if(Runtime.plugin_modules[path]) {
                return Runtime.plugin_modules[path];
            } else {
                let raw_file = fs.readFileSync(`${Runtime.getBridgePath()}plugins/${path}`);
                if(raw_file != undefined) new Interpreter().execute(raw_file.toString(), path, this.__bridge_import_depth__ - 1, true, blocked);
                return Runtime.plugin_modules[path];
            }
        };
        this.provide = (data) => {
            Runtime.plugin_modules[this.__file_path__] = data;
            return {
                as(id) {
                    Runtime.plugin_modules[id] = data;
                }
            }
        };

        this.fetch = (input, init) => {
            if(blocked) {
                const then_case = {
                    then() { return then_case },
                    catch() { return catch_case },
                    finally() {}
                };
                const catch_case = {
                    then_case,
                    catch_case,
                    finally() {}
                };
                return then_case;
            }
            
            return window.fetch(input, init);
        }
    }
}

class Interpreter {
    constructor() {

    }

    wrap(code) {
        return `(function() { ${code} })()`;
    }

    /**
     * 
     * @param {*} code 
     * @param {*} file_path 
     * @param {*} depth 
     * @param {*} is_module 
     * @param {Boolean} blocked Whether the environment should run inside blocked mode
     */
    execute(code, file_path, depth, is_module=false, blocked) {
        try {
            return saveEval(this.wrap(code), new Environment(file_path, depth, is_module, blocked), { file_path });
        } catch(e) {
            let tmp = e.stack.split("\n");
            tmp.shift();
            console.groupCollapsed(`%c${e.message} inside ${file_path}.`, "background-color: #ff3d3d; color: white; padding: 0 2px; border-radius: 2px;");
            console.log(tmp[0]);
            console.groupEnd();
        }
    }

    init(project) {
        Runtime.project = project;

        let path = `${Runtime.getBridgePath()}plugin_storage/`;
        if(!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }

        let u_path = Runtime.getBridgePath() + "uninstalled_plugins.json";
        if(!fs.existsSync(u_path)) {
            fs.writeFile(u_path, "[]", (err) => {
                if(err) console.log(err);
            });
            return [];
        } else {
            return JSON.parse(fs.readFileSync(u_path).toString());
        }
    }
}

export default {
    Interpreter: new Interpreter(),
    getMenus: () => Runtime.menus,
    getPlugins: () => Runtime.plugins,
    getSidebar: () => Runtime.sidebar,
    Runtime: {
        getBridgePath: Runtime.getBridgePath
    },
    hljs: {
        unregisterAll() {
            Runtime.hljs_languages.forEach(lang => hljs.unregisterLanguage(lang));
        }
    },
    reset,
    trigger: (name, arg, readonly=false) => {
        if(readonly) return readonlyTrigger(name, arg);
        return trigger(name, arg);
    }
} 