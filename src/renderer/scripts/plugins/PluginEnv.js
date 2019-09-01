import saveEval from "safe-eval";
import fs from "fs";
import { promises as fsp } from "fs";
import Runtime from "./Runtime";
import BlockedBridge from "./BlockedBridge";
import Bridge from "./Bridge";
import { trigger, readonlyTrigger } from "./EventTriggers";
import PluginAssert from "./PluginAssert";
import cJSON from "comment-json";
import deepmerge from "deepmerge";
import mkdirp from "mkdirp";
import { join } from "path";

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
            this.LIB = { deepmerge() {} }
        } else {
            this.Bridge = new Bridge(is_module, file_path);
            this.console = {
                log: console.log,
                warn: console.warn,
                error: console.error,
                dir: console.dir
            };
            this.JSON = {
                parse: (text) => cJSON.parse(text, undefined, true),
                stringify: JSON.stringify
            };
            this.LIB = {
                deepmerge,
            };
            // this.document = window.document;
        }

        this.use = (path) => {
            if(this.__bridge_import_depth__ <= 0) {
                throw new Error("Recursion depth too deep. Flatten your project structure and make sure that you haven't created an import loop.");
            }
            
            if(Runtime.Modules.exists(path)) {
                return Runtime.Modules.get(path);
            } else {
                let raw_file = fs.readFileSync(`${Runtime.Paths.bridge()}plugins/${path}`);
                if(raw_file != undefined) new Interpreter().execute(raw_file.toString(), path, this.__bridge_import_depth__ - 1, true, blocked);
                return Runtime.Modules.get(path);
            }
        };
        this.provide = (data) => {
            Runtime.Modules.add(this.__file_path__, data);
            return {
                as(id) {
                    Runtime.Modules.add(id, data);
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

    wrap(code, file_path) {
        return `(function ${file_path.replace(/[^a-zA-Z]/g, "_")}() {${code}})()`;
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
            return saveEval(this.wrap(code, file_path), new Environment(file_path, depth, is_module, blocked), { file_path });
        } catch(err) {
            PluginAssert.throw(file_path, err);

            let tmp = err.stack.split("\n");
            tmp.shift();
            console.groupCollapsed(`%c${err.message} inside ${file_path}.`, "background-color: #ff3d3d; color: white; padding: 0 2px; border-radius: 2px;");
            console.log(tmp.join("\n"));
            console.groupEnd();
        }
    }

    async init(project) {
        Runtime.Paths.setProject(project);

        let path = join(Runtime.Paths.bridge(), "plugin_storage");
        let u_path = join(Runtime.Paths.bridge(), "uninstalled_plugins.json");
        mkdirp.sync(path);

        try {
            return JSON.parse((await fsp.readFile(u_path)).toString());
        } catch(e) {
            fsp.writeFile(u_path, "[]");
            return [];
        }
    }
}

export default {
    Interpreter: new Interpreter(),
    getMenus: () => Runtime.Menus.get(),
    getPlugins: () => Runtime.Plugins.get(),
    getSidebar: () => Runtime.Sidebar.get(),
    Runtime: {
        getBridgePath: Runtime.Paths.bridge
    },
    hl: {
        unregisterAll() {
            Runtime.HL.forEach(lang => Runtime.HL.remove(lang));
        }
    },
    reset: Runtime.reset,
    trigger: (name, arg, readonly=false, init) => {
        if(readonly) return readonlyTrigger(name, arg);
        return trigger(name, arg, init);
    }
} 