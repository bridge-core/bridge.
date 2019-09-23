import fs from "fs";
import deepmerge from "deepmerge";
import VersionMap from "../editor/VersionMap";
import Store from "../../store/index";
import { DYNAMIC, SET_CONTEXT, CONTEXT_UP, CONTEXT_DOWN } from "./Dynamic";
import { detachMerge as detachObj } from "../mergeUtils";
import ComponentProvider from "./Components";
import Assert from "../plugins/PluginAssert";
import FileType from "../editor/FileType";
import { Omega } from "./Omega";

let FILE_DEFS = [];
let PLUGIN_FILE_DEFS = [];
let PLUGIN_COMPLETIONS = [];
let PLUGINS_TO_LOAD = [];
let LIB_LOADED = false;
const REMOVE_LIST = [ "$load", "$dynamic_template", "$placeholder" ];
export let LIB = { dynamic: DYNAMIC };

class Provider {
    constructor(current) {
        this.validator(current);
    }
    static loadAssets() {
        let total = 0;
        this.loadAsset("files")
            .then(files => files.forEach(
                f => this.loadAsset(f)
                    .then(data => {
                        //ALLOW MULTIPLE FILES TO REGISTER THE SAME LIB KEY
                        if(data.$register_as !== undefined) {
                            f = data.$register_as;
                            delete data.$register_as;
                        }

                        this.storeInLIB(f, data);
                        total ++;
                        if(total >= files.length) {
                            LIB_LOADED = true;
                            this.loadAllPluginCompletions();
                        }
                    })
            ));
        this.loadAsset("file_definitions", "data/")
            .then(def => FILE_DEFS = def);
    }
    static loadAsset(name, path="auto_completions/") {
        return new Promise((resolve, reject) => {
            fs.readFile(__static + `/${path}${name}.json`, (err, data) => {
                if(err) reject(err);
                try {
                    resolve(JSON.parse(data.toString()));
                } catch(err) {
                    throw new Error(`File ${name} contains invalid JSON: ${err.message}`);
                }
            });
        });
    }
    static storeInLIB(path, store, current=LIB, native=true) {
        if(typeof path === "string") path = path.split("/");
        let key = path.shift();
        let created = false;
        if(current[key] === undefined) {
            current[key] = {};
            created = true;
        }
        if(!native) PLUGIN_COMPLETIONS[PLUGIN_COMPLETIONS.length - 1].push({ key, created });

        if(path.length > 0) {
            this.storeInLIB(path, store, current[key], native);
        } else if(native || created) {            
            current[key] = deepmerge(current[key], store);
        } else if(!native && path.length > 0) {
            return Assert.throw("Auto-Completions", new Error("Unable to register auto-completions to already exisiting path."));
        }
    }
    static removeFromLib(path, current=LIB) {
        let { key, created } = path.shift();
        // console.log(key, created);
        if(path.length > 0) this.removeFromLib(path, current[key]);
        if(created) delete current[key];    
    }
    static addPluginCompletion(path, def) {
        if(!LIB_LOADED) PLUGINS_TO_LOAD.push({ path, def });
        else {
            PLUGIN_COMPLETIONS.push([]);
            this.storeInLIB(path, def, undefined, false);
        }
    }
    static loadAllPluginCompletions() {
        PLUGINS_TO_LOAD.forEach(({ path, def }) => {
            PLUGIN_COMPLETIONS.push([]);
            this.storeInLIB(path, def, undefined, false);
        });
        PLUGINS_TO_LOAD = [];
    }
    static removePluginCompletions() {
        PLUGIN_COMPLETIONS.forEach(comp => this.removeFromLib(comp));
        PLUGIN_COMPLETIONS = [];
    }
    static addPluginFileDef(def) {
        PLUGIN_FILE_DEFS.push(def);
    }
    static removePluginFileDefs() {
        PLUGIN_FILE_DEFS = [];
    }
    static get FILE_DEFS() {
        return FILE_DEFS.concat(PLUGIN_FILE_DEFS);
    }
    get FILE_DEFS() {
        return FILE_DEFS.concat(PLUGIN_FILE_DEFS);
    }

    validator(path) {
        if(path === undefined) return this.start_state = "unknown";
        for(let def of this.FILE_DEFS) {
            if(FileType.pathIncludes(path, def.includes) && (path.includes("development_behavior_packs") || def.rp_definition || FileType.fallbackToBP(path))) 
                return this.start_state = def.start_state;
        }
        return this.start_state = "unknown";
    }

    get(path, context) {
        if(this.start_state === "unknown") return { object: [], value: [], META: {} };
        path = path.replace("global", 
            VersionMap.convert(this.start_state, Store.state.Settings.target_version)
        );
        
        SET_CONTEXT(context, context === undefined ? undefined : context.parent);
        let propose = this.walk(path.split("/"));
        // console.log("[PROPOSING]", path, propose, LIB);

        return this.preparePropose(propose, context === undefined ? [] : Object.keys(context.toJSON(false)));
    }

    preparePropose(propose, context) {
        if(propose.object === LIB) return { value: [], object: [] };
        let { object, value } = propose;
        let META = {};

        if(object.$load !== undefined) {
            let { object: object_internal, value: value_internal } = this.omegaExpression(object.$load);

            object = detachObj(object, object_internal);
            value = value.concat(value_internal);
        }
        if(object.$dynamic_template !== undefined) {
            let t = this.compileTemplate(object.$dynamic_template);
            if(t !== undefined) {
                object = detachObj(object, t);
            } 
        }

        return {
            object: Object.keys(object)
                .map(key => {
                    if(key.startsWith("$dynamic_template.")) {
                        if(object[key].$if === undefined || Omega.walk(object[key].$if))
                            return key.split(".").pop();
                    } else if(key.startsWith("@import.value")) {
                        let { object: object_internal, value: value_internal } = this.omegaExpression(object[key]);
                        if(object_internal["@meta"]) detachObj(META, object_internal["@meta"]);

                        value.push(...value_internal);
                        value.push(...Object.keys(object_internal));
                        return;
                    } else if(key.startsWith("@value.")) {
                        value.push(key.split(".").pop());
                        return;
                    } else if(key === "@meta") {
                        META = deepmerge(META, object["@meta"]);
                        return;
                    } else if(key === "$asObject") {
                        return Omega.walk(object.$asObject);
                    }
                    if(REMOVE_LIST.includes(key)) return undefined;

                    if(key[0] === "$") {
                        let { object: object_internal, value: value_internal } = this.omegaExpression(key);
                        return Object.keys(object_internal).concat(...value_internal);
                    }
                    return key;
                })
                .reduce((propose, element) => {
                    if(!Array.isArray(element)) element = [element];
                    
                    if(element[0] !== undefined)
                        return propose.concat(element.filter(e => !context.includes(e)));
                    return propose;
                }, []),
            value: value.filter(e => typeof e === "string" && e !== ""),
            META
        }
    }

    walk(path_arr, current=LIB) {
        if(typeof current === "function") {
            if(path_arr.length === 0)
                return { object: {}, value: current() };
            current = current();
        } else if(typeof current === "string") {
            for(let i = 0; i < path_arr.length + 1; i++) CONTEXT_UP();
            let { object, value } = this.omegaExpression(current);
            for(let i = 0; i < path_arr.length + 1; i++) CONTEXT_DOWN();

            if(path_arr.length === 0)
                return { object, value };

            current = object;
        } else if(path_arr === undefined || path_arr.length === 0 || current === undefined) {
            if(Array.isArray(current))
                return { object: {}, value: current };
            return { object: current, value: [] };
        }

        let key = path_arr.shift();
        if(current[key] === undefined) {
            let res = ComponentProvider.process(this, key, path_arr, current);
            if(res !== undefined) {
                return res;
            } else if(current !== LIB) {
                for(let k of Object.keys(current)) {
                    if(k[0] === "$") {
                        for(let i = 0; i < path_arr.length + 1; i++) CONTEXT_UP();
                        let { object, value } = this.omegaExpression(k);
                        for(let i = 0; i < path_arr.length + 1; i++) CONTEXT_DOWN();

                        if(value.includes(key) || object[key] !== undefined)
                            return this.walk(path_arr, current[k]);
                    }
                }
            }
        }
        return this.walk(path_arr, current[key]);
    }

    omegaExpression(expression) {
        // console.log(Omega.eval(expression));
        return Omega.eval(expression);
    }

    compileTemplate(template) {
        if(template.$if !== undefined && !Omega.walk(template.$if)) return {};

        let dyn = Omega.walk(template["$key"]);
        if(template[`$dynamic_template.${dyn}`] !== undefined) {
            return this.compileTemplate(template[`$dynamic_template.${dyn}`]);
        }
        return template[dyn || "$fallback"] || template["$default"];
    }
}
Provider.loadAssets();

export default Provider;