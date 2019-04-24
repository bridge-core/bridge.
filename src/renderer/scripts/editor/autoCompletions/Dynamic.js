import { BASE_PATH } from "../../constants";
import TabSystem from "../../TabSystem";
import JsonCacheUtils from "../JSONCacheUtils";
import Store from "../../../store/index";
import path from "path";
import fs from "fs";

let PARENT_CONTEXT = {};
let NODE_CONTEXT = {};
let PREV_CONTEXT = undefined;

function walkSync(dir, filelist = []) {
    fs.readdirSync(dir).forEach(file => {
  
        filelist = fs.statSync(path.join(dir, file)).isDirectory()
            ? walkSync(path.join(dir, file), filelist)
            : filelist.concat(path.join(dir, file));
  
    });
    return filelist;
}

export function SET_CONTEXT(node, parent) {
    PARENT_CONTEXT = parent;
    NODE_CONTEXT = node;
}
export function CONTEXT_UP() {
    PREV_CONTEXT = NODE_CONTEXT;
    if(NODE_CONTEXT !== undefined) NODE_CONTEXT = NODE_CONTEXT.parent;
    if(PARENT_CONTEXT !== undefined) PARENT_CONTEXT = PARENT_CONTEXT.parent;
}
export function CONTEXT_DOWN() {
    if(PREV_CONTEXT !== undefined) {
        PARENT_CONTEXT = NODE_CONTEXT;
        NODE_CONTEXT = PREV_CONTEXT;
        PREV_CONTEXT = undefined;
    } else {
        throw new Error("Called CONTEXT_DOWN without PREV_CONTEXT.");
    }
}

export const DYNAMIC = {
    list: {
        next_index() {
            let arr = NODE_CONTEXT.toJSON();
            if(Array.isArray(arr)) {
                let res = [];
                for(let i = arr.length; i >= 0; i--) {
                    res.push(i + "");
                }
                return res;
            }
            return [ "0" ];
        },
        index_pair() {
            let arr = NODE_CONTEXT.toJSON();
            if(Array.isArray(arr)) return [ "0", "1" ];
            return [ "0" ];
        },
        index_triple() {
            let arr = NODE_CONTEXT.toJSON();
            if(Array.isArray(arr) && arr.length >= 2) return [ "1", "2" ];
            if(Array.isArray(arr)) return [ "0", "1" ];
            return [ "0" ];
        }
    },
    setting: {
        target_version() {
            return Store.state.Settings.target_version;
        }
    },
    entity: {
        component_list() {
            // return Object.keys(LIB.entity.main_v1_11["minecraft:entity"].components);
            return [];
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
    recipe: {
        pattern_keys() {
            try {
                let data = TabSystem.getSelected().content.get("minecraft:recipe_shaped/pattern").toJSON();
                return data.map(e => e.split("")).reduce((acc, curr) => acc.concat(curr), []);
            } catch(e) {
                console.log(e);
                return [];
            }
        }
    },
    biome: {
        name_references() {
            return walkSync(BASE_PATH + Store.state.Explorer.project + "\\biomes").map(e => {
                return e.split(/\\|\//g).pop().replace(".json", "");
            });
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
};