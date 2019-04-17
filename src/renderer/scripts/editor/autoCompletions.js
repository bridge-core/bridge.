import fs from "fs";
import { BASE_PATH } from "../constants";
import TabSystem from "../TabSystem";
import deepmerge from "deepmerge";
import VersionMap from "./VersionMap";
import Store from "../../store/index";
import ScopeGuard from "./ScopeGuard";
import path from "path";
import JsonCacheUtils from "./JSONCacheUtils";


let FILE_DEFS = [];
let PARENT_CONTEXT = {};
let NODE_CONTEXT = {};

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
  
        filelist = fs.statSync(path.join(dir, file)).isDirectory()
            ? walkSync(path.join(dir, file), filelist)
            : filelist.concat(path.join(dir, file));
  
    });
    return filelist;
}

let LIB = {
    $dynamic: {
        list: {
            next_index() {
                let arr = TabSystem.getSelected().content.get(TabSystem.getCurrentNavigation()).toJSON();
                if(Array.isArray(arr)) return arr.length + "";
                return "0";
            },
            index_pair() {
                let arr = TabSystem.getSelected().content.get(TabSystem.getCurrentNavigation()).toJSON();
                if(Array.isArray(arr)) return "1";
                return "0";
            },
            index_triple() {
                let arr = TabSystem.getSelected().content.get(TabSystem.getCurrentNavigation()).toJSON();
                if(Array.isArray(arr) && arr.length >= 2) return "2";
                if(Array.isArray(arr)) return "1";
                return "0";
            }
        },
        setting: {
            target_version() {
                return Store.state.Settings.target_version;
            }
        },
        entity: {
            component_list() {
                return Object.keys(LIB.entity.main_v1_11["minecraft:entity"].components);
            },
            cached_families() {
                return JsonCacheUtils.families;
            },
            component_groups() {
                try {
                    return Object.keys(TabSystem.getSelected().content.get("minecraft:entity/component_groups").toJSON());
                } catch(e) {
                    return [];
                }
            },
            events() {
                try {
                    return Object.keys(TabSystem.getSelected().content.get("minecraft:entity/events").toJSON());
                } catch(e) {
                    console.log(e);
                    return [];
                }
            },
            "@events"() {
                return JsonCacheUtils.events.map(e => "@s " + e);
            },
            animation_references() {
                return JsonCacheUtils.animation_references;
            }
        },
        animation_controller: {
            current_states() {
                let current = TabSystem.getCurrentNavObj();
                if(Object.keys(current.toJSON()).length > 0) return [];

                
                while(current !== undefined && current.key !== "states") {
                    current = current.parent;
                }
                if(current.key === "states") return Object.keys(current.toJSON());
                return [];
            }
        },
        animation_controller_ids() {
            return JsonCacheUtils.animation_controller_ids;
        },
        animation_ids() {
            return JsonCacheUtils.animation_ids;
        },
        siblings() {
            return PARENT_CONTEXT.toJSON();
        },
        children() {
            return NODE_CONTEXT.toJSON();
        },
        current_file_name() {
            let arr = TabSystem.getSelected().file_path.split(/\/|\\/g).pop().split(".");
            arr.pop()
            return [ arr.join(".") ];
        },
        loot_table_files() {
            try {
                return walkSync(BASE_PATH + Store.state.Explorer.project + "\\loot_tables").map(e => {
                    return e.replace(BASE_PATH.replace(/\//g, "\\") + Store.state.Explorer.project + "\\", "").replace(/\\/g, "/");
                });
            } catch(e) {
                return [];
            }
        },
        trade_table_files() {
            try {
                return walkSync(BASE_PATH + Store.state.Explorer.project + "\\trading").map(e => {
                    return e.replace(BASE_PATH.replace(/\//g, "\\") + Store.state.Explorer.project + "\\", "").replace(/\\/g, "/");
                });
            } catch(e) {
                return [];
            }
        }
    }
};
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

        if(typeof propose === "string") {
            let prev_path = path.split("/");
            propose = this.omegaExpression(propose, prev_path.pop(), prev_path);
        }

        // console.log("[PROPOSING]", propose, LIB);
        if(propose === LIB) return { value: [], object: [] };
        if(Array.isArray(propose)) return { value: propose };

        //DYNAMIC LOAD INSTRUCTION
        if(propose.$load !== undefined) {
            Object.assign(propose, this.omegaExpression(propose.$load));
            delete propose.$load;
        }
        if(propose.$dynamic_template !== undefined) {
            let t = this.compileTemplate(propose.$dynamic_template);
            if(t !== undefined) {
                propose = Object.assign(propose, t);
                this.installScopeGuard(propose, t);
            } 
        }

        return { 
            object: Object.keys(propose).filter(e => e != "$placeholder" && e != "$dynamic_template").map(key => {
                if(key.startsWith("$dynamic_template.")) {
                    return key.split(".").pop();
                }

                if(key[0] === "$") {
                    // console.log(this.omegaExpression(key))
                    let exp = this.omegaExpression(key);
                    if(typeof exp === "object" && !Array.isArray(exp)) return Object.keys(exp)[0];
                    return exp;
                }
                return key;
            }).reduce((acc, val) => acc.concat(val), []) 
        };
    }

    walk(path_arr, current=LIB) {
        if(path_arr === undefined || path_arr.length === 0 || current === undefined) return current;
        let key = path_arr.shift();

        if(typeof current[key] === "string") {
            let o = this.omegaExpression(current[key], null, null, false);
            if(typeof current !== "string" && !current[key].startsWith("$dynamic."))
                current[key] = o;
            else 
                return this.walk(path_arr, o);
        } else if(current["$dynamic_template." + key] !== undefined) {
            current = this.compileTemplate(current["$dynamic_template." + key]);
            if(typeof current === "string") {
                current = this.omegaExpression(current, null, null, false);
            }
            return this.walk(path_arr, current);
        } else if(current[key] === undefined) {
            if(current["$dynamic_template"] !== undefined) {
                for(let i = 0; i < path_arr.length + 1; i++) this.contextUp();

                let t = this.compileTemplate(current["$dynamic_template"]);
                if(t !== undefined) {
                    current = Object.assign(current, t);
                    this.installScopeGuard(current, t);
                } 
            }

            if(current[key] === undefined  && current["$placeholder"] === undefined  && current !== LIB) {
                for(let k of Object.keys(current)) {
                    if(k.startsWith("$dynamic.")) {
                        key = k;
                        break;
                    }
                }
            } else if(current["$placeholder"] !== undefined) {
                key = "$placeholder";
            }
        }
        return this.walk(path_arr, current[key]);
    }

    omegaExpression(str, key, prev_path, set=true) {
        let parts = str.split(" and ");
        let result = [];
        
        parts.forEach(part => {
            let current;
            if(part.includes("$dynamic")) {
                current = this.dynamic(part);
                if(typeof current != "object") current = { [current]: {} };
            } else {
                current = this.static(part.substring(1, part.length));
            }

            if(!Array.isArray(current)) {
                if(Array.isArray(result)) result = {};
                // console.log(result, current)
                if(current !== undefined) result = deepmerge(result, current);
            } else {
                result.push(...current);
            }
        });

        if(set && !str.includes("$dynamic")) {
            let walked = this.walk(prev_path);
            if(typeof walked === "object" && walked !== LIB) walked[key] = result;
        }
        return result;
    }

    setupContext(c) {
        NODE_CONTEXT = c;
        PARENT_CONTEXT = c.parent;
    }
    contextUp() {
        if(NODE_CONTEXT !== undefined) NODE_CONTEXT = NODE_CONTEXT.parent;
        if(PARENT_CONTEXT !== undefined) PARENT_CONTEXT = PARENT_CONTEXT.parent;
    }

    installScopeGuard(propose, new_propose) {
        ScopeGuard.onScopeChange(() => {
            // console.log(JSON.stringify(propose));
            Object.keys(new_propose).forEach(key => {
                delete propose[key];
            });
            // console.log(JSON.stringify(propose));
        });
    }

    compileTemplate(template) {
        // console.log(template["$key"], this.dynamic(template["$key"]), template[this.dynamic(template["$key"])]);
        return template[this.dynamic(template["$key"])];
    }

    //OMEGA HELPERS
    dynamic(expression) {
        let keys = expression.split(".");
        let current = LIB;
        while(keys.length > 0 && current != undefined) {
            current = current[keys.shift()];
            if(typeof current == "function") current = current();
            // console.log(current);
        }
        return current;
    }
    static(expression) {
        let current = LIB;
        let path = expression.split(".");

        path.forEach(p => {
            if(current != undefined) current = current[p.replace(/\&dot\;/g, ".")];
        });

        if(typeof current === "string") current = this.omegaExpression(current, path.pop(), path);
        return current;
    }
}
Provider.loadAssets();

export default Provider;