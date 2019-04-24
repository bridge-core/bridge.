import fs from "fs";
import { BASE_PATH } from "../constants";
import deepmerge from "deepmerge";
import VersionMap from "./VersionMap";
import Store from "../../store/index";
import ScopeGuard from "./ScopeGuard";
import DYNAMIC from "./autoCompletions/Dynamic";

let FILE_DEFS = [];
let PARENT_CONTEXT = {};
let NODE_CONTEXT = {};
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
        this.setupContext(context);
        let propose = this.walk(path.split("/"));
        console.log("[PROPOSING]", path, propose, context.toJSON(false));

        return this.preparePropose(propose, Object.keys(context.toJSON(false)));
    }

    preparePropose(propose, context) {
        if(propose.object === LIB) return { value: [], object: [] };
        let { object, value } = propose;

        if(object.$load !== undefined) {
            let { object: object_internal, value: value_internal } = this.omegaExpression(object.$load);
            object = Object.assign({}, object, object_internal);
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
                    if(element !== undefined && !context.includes(element))
                        return propose.concat(element);
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
            return {
                object: current,
                value: []
            };
        }

        let key = path_arr.shift();
        if(current["$dynamic_template." + key] !== undefined) {
            return this.walk(path_arr, this.compileTemplate(current["$dynamic_template." + key]));
        } else if(current[key] === undefined) {
            if(current["$dynamic_template"] !== undefined) {
                for(let i = 0; i < path_arr.length + 1; i++) this.contextUp();

                return this.walk(path_arr, this.compileTemplate(current["$dynamic_template"]))
            }

            if(current["$placeholder"] !== undefined) {
                return this.walk(path_arr, current["$placeholder"]);
            } else if(current !== LIB) {
                for(let k of Object.keys(current)) {
                    if(k[0] === "$") {
                        let { object, value } = this.omegaExpression(k);
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
            let tmp = this.dynamic(part.substring(1, part.length));
            if(typeof tmp === "string") {
                let { object: object_internal, value: value_internal } = this.omegaExpression(tmp);
                value = value.concat(value_internal);
                object = Object.assign(object, object_internal);
            } else if(Array.isArray(tmp))
                value.push(...tmp);
            else
                object = Object.assign(object, tmp);
        });

        return {
            object, 
            value 
        };
    }
    compileTemplate(template) {
        return template[this.dynamic(template["$key"])];
    }

    setupContext(c) {
        NODE_CONTEXT = c;
        PARENT_CONTEXT = c.parent;
    }
    contextUp() {
        if(NODE_CONTEXT !== undefined) NODE_CONTEXT = NODE_CONTEXT.parent;
        if(PARENT_CONTEXT !== undefined) PARENT_CONTEXT = PARENT_CONTEXT.parent;
    }

    //OMEGA HELPERS
    dynamic(expression) {
        let path = expression.split(".");
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