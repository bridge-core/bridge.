import fs from "fs";
import { BASE_PATH } from "../constants";
import deepmerge from "deepmerge";
import VersionMap from "./VersionMap";
import Store from "../../store/index";
import { DYNAMIC, SET_CONTEXT, CONTEXT_UP, CONTEXT_DOWN } from "./autoCompletions/Dynamic";
import detachObj from "../detachObj";

let FILE_DEFS = [];
const REMOVE_LIST = [ "$load", "$dynamic_template", "$placeholder" ]
let LIB = { dynamic: DYNAMIC };

class Provider {
    constructor(current) {
        this.validator(current);
    }
    static loadAssets() {
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
                    })
            ));
        this.loadAsset("file_definitions", "data/")
            .then(def => FILE_DEFS = def);
    }
    static loadAsset(name, path="auto_completions/") {
        return new Promise((resolve, reject) => {
            fs.readFile(__static + `/${path}${name}.json`, (err, data) => {
                if(err) reject(err);
                resolve(JSON.parse(data.toString()));
            });
        });
    }
    static storeInLIB(path, store, current=LIB) {
        if(typeof path === "string") path = path.split("/");
        let key = path.shift();

        if(current[key] === undefined) current[key] = {};

        if(path.length > 0) this.storeInLIB(path, store, current[key]);
        else current[key] = deepmerge(current[key], store);
    }
    static get FILE_DEFS() {
        return FILE_DEFS;
    }

    validator(path) {
        path = path.replace(BASE_PATH, "");
        for(let def of FILE_DEFS) {
            if(path.includes(def.includes)) return this.start_state = def.start_state;
        }
    }

    get(path, context) {
        path = path.replace("global", 
            VersionMap.convert(this.start_state, Store.state.Settings.target_version)
        );
        SET_CONTEXT(context, context.parent);
        let propose = this.walk(path.split("/"));
        console.log("[PROPOSING]", path, propose, LIB);

        return this.preparePropose(propose, Object.keys(context.toJSON(false)));
    }

    preparePropose(propose, context) {
        if(propose.object === LIB) return { value: [], object: [] };
        let { object, value } = propose;

        if(object.$load !== undefined) {
            let { object: object_internal, value: value_internal } = this.omegaExpression(object.$load);
            object = detachObj({}, object, object_internal);
            value = value.concat(value_internal);
        }
        if(object.$dynamic_template !== undefined) {
            let t = this.compileTemplate(object.$dynamic_template);
            if(t !== undefined) {
                object = Object.assign({}, object, t);
            } 
        }

        return {
            object: Object.keys(object)
                .map(key => {
                    if(key.startsWith("$dynamic_template.")) {
                        return key.split(".").pop();
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
                        return propose.concat(element.filter((e) => !context.includes(e)));
                    return propose;
                }, []),
            value
        }
    }

    walk(path_arr, current=LIB) {
        if(typeof current === "string") {
            let { object, value } = this.omegaExpression(current);
            if(path_arr.length === 0)
                return { object, value };

            current = object;
        } else if(path_arr === undefined || path_arr.length === 0 || current === undefined) {
            if(Array.isArray(current))
                return { object: {}, value: current };
            return { object: current, value: [] };
        }

        let key = path_arr.shift();
        if(current["$dynamic_template." + key] !== undefined) {
            return this.walk(path_arr, this.compileTemplate(current["$dynamic_template." + key]));
        } else if(current[key] === undefined) {
            if(current["$dynamic_template"] !== undefined) {
                for(let i = 0; i < path_arr.length + 1; i++) CONTEXT_UP();

                return this.walk(path_arr, this.compileTemplate(current["$dynamic_template"]))
            }

            if(current["$placeholder"] !== undefined) {
                return this.walk(path_arr, current["$placeholder"]);
            } else if(current !== LIB) {
                for(let k of Object.keys(current)) {
                    if(k[0] === "$") {
                        CONTEXT_UP();
                        let { object, value } = this.omegaExpression(k);
                        CONTEXT_DOWN();
                        if(value.includes(key) || object[key] !== undefined)
                            return this.walk(path_arr, current[k]);
                    }
                }
            }
        }
        return this.walk(path_arr, current[key]);
    }

    omegaExpression(expression) {
        let parts = expression.split(" and ");
        let object = {};
        let value = [];
        
        parts.forEach(part => {
            let tmp = this.dynamic(part);
            if(typeof tmp === "string") {
                let { object: object_internal, value: value_internal } = this.omegaExpression(tmp);
                value = value.concat(value_internal);
                object = detachObj(object, object_internal);
            } else if(Array.isArray(tmp))
                value.push(...tmp);
            else
                object = detachObj(object, tmp);
        });

        return {
            object, 
            value 
        };
    }
    compileTemplate(template) {
        return template[this.dynamic(template["$key"])];
    }

    //OMEGA HELPERS
    dynamic(expression) {
        let path = expression.substring(1, expression.length).split(".");
        let current = LIB;
        while(path.length > 0 && current !== undefined) {
            current = current[path.shift().replace(/\&dot\;/g, ".")];
            if(typeof current === "function") current = current();
        }

        return current;
    }
}
Provider.loadAssets();

export default Provider;