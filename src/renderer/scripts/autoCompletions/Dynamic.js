import { BASE_PATH, RP_BASE_PATH, CURRENT } from "../constants";
import TabSystem from "../TabSystem";
import Store from "../../store/index";
import path from "path";
import fs from "fs";
import LightningCache from "../editor/LightningCache";
import { BridgeCore } from "../plugins/bridgeCore/main";
import { readJSONSync } from "../utilities/JsonFS";
import ProjectConfig from "../ProjectConfig";

let PARENT_CONTEXT = {};
let NODE_CONTEXT = {};
let PREV_CONTEXT = [];

export function walkSync(dir, relative=false, relative_path="", filelist=[]) {
    fs.readdirSync(dir).forEach(file => {
  
        filelist = fs.statSync(path.join(dir, file)).isDirectory()
            ? walkSync(path.join(dir, file), relative, path.join(relative_path, file), filelist)
            : filelist.concat(path.join(relative ? relative_path : dir, file));
  
    });
    return filelist;
}

export function SET_CONTEXT(node, parent) {
    PARENT_CONTEXT = parent;
    NODE_CONTEXT = node;
}
export function CONTEXT_UP() {
    PREV_CONTEXT.push(NODE_CONTEXT);
    if(NODE_CONTEXT !== undefined) NODE_CONTEXT = NODE_CONTEXT.parent;
    if(PARENT_CONTEXT !== undefined) PARENT_CONTEXT = PARENT_CONTEXT.parent;
}
export function CONTEXT_DOWN() {
    if(PREV_CONTEXT.length > 0) {
        PARENT_CONTEXT = NODE_CONTEXT;
        NODE_CONTEXT = PREV_CONTEXT.pop();
    } else if(NODE_CONTEXT !== undefined) {
        throw new Error("Called CONTEXT_DOWN without PREV_CONTEXT.");
    }
}

export const DYNAMIC = {
    get cache() {
        return LightningCache.getCompiledSync();
    },
    bridge_core: {
        is_active() {
            return BridgeCore.isActive();
        },
        is_not_active() {
            return !BridgeCore.isActive();
        }
    },
    list: {
        next_index() {
            if(NODE_CONTEXT.is_array) {
                let res = [];
                let arr = NODE_CONTEXT.toJSON();

                for(let i = arr.length; i >= 0; i--) {
                    res.push(i + "");
                }
                return res;
            }
            return [ "0" ];
        },
        index_pair() {
            return [ "0", "1" ];
        },
        index_triple() {
            return [ "0", "1", "2" ];
        }
    },
    setting: {
        target_version() {
            return Store.state.Settings.target_version;
        },
        project_prefix() {
            return ProjectConfig.getPrefixSync() + ":";
        }
    },
    entity: {
        component_list() {
            return [];
        },
        cached_families() {
            return LightningCache.getCompiledSync().entity.families;
        },
        component_groups() {
            try {
                return Object.keys(TabSystem.getSelected().content.get("minecraft:entity/component_groups").toJSON());
            } catch(e) { return []; }
        },
        events() {
            try {
                return Object.keys(TabSystem.getSelected().content.get("minecraft:entity/events").toJSON());
            } catch(e) { return []; }
        },
        all_events() {
            return LightningCache.getCompiledSync().entity.events;
        },
        "@events"() {
            console.warn("[DEPRECATION] \"@events\" - Use \"('@s ' + $dynamic.entity.all_events) instead\"");
            return LightningCache.getCompiledSync().entity.events.map(e => "@s " + e);
        },
        animation_references() {
            try {
                return Object.keys(TabSystem.getSelected().content.get("minecraft:entity/description/animations").toJSON());
            } catch(e) { return []; }
        }
    },
    recipe: {
        pattern_keys() {
            try {
                let data = TabSystem.getSelected().content.get("minecraft:recipe_shaped/pattern").toJSON();
                let res = [];
                data.forEach(e => res = res.concat(e.split("")));
                return res.filter(e => e !== " ");
            } catch(e) { return []; }
        }
    },
    biome: {
        name_references() {
            return walkSync(CURRENT.PROJECT_PATH + "\\biomes").map(e => {
                return e.split(/\\|\//g).pop().replace(".json", "");
            });
        },
        feature_references() {
            return walkSync(CURRENT.PROJECT_PATH + "\\features").map(e => {
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
    client_entity: {
        animation_references() {
            try {
                return Object.keys(TabSystem.getSelected().content.get("minecraft:client_entity/description/animations").toJSON());
            } catch(e) { return []; }
        }
    },
    rp: {
        item_textures() {
            try {
                return Object.keys(readJSONSync(path.join(CURRENT.RP_PATH, "/textures/item_texture.json")).texture_data);
            } catch(e) { return []; }
        },
        terrain_texture() {
            try {
                return Object.keys(readJSONSync(path.join(CURRENT.RP_PATH, "/textures/terrain_texture.json")).texture_data);
            } catch(e) { console.log(e); return []; }
        },
        entity_textures() {
            try {
                return walkSync(path.join(CURRENT.RP_PATH, "/textures/entity"))
                    .map(e => {
                        let tmp = e.replace(RP_BASE_PATH.replace(/\//g, "\\") + Store.state.Explorer.project.resource_pack + "\\", "").replace(/\\/g, "/");
                        return `${path.dirname(tmp)}/${path.basename(tmp, path.extname(tmp))}`;
                    });
            } catch(e) { return []; }
        },
        item_png() {
            try {
                return walkSync(path.join(CURRENT.RP_PATH, "/textures/items")).map(e => {
                    let tmp = e.replace(RP_BASE_PATH.replace(/\//g, "\\") + Store.state.Explorer.project.resource_pack + "\\", "").replace(/\\/g, "/");
                    return `${path.dirname(tmp)}/${path.basename(tmp, path.extname(tmp))}`;
                });
            } catch(e) { return []; }
        },
        block_png() {
            try {
                return walkSync(path.join(CURRENT.RP_PATH, "/textures/blocks")).map(e => {
                    let tmp = e.replace(RP_BASE_PATH.replace(/\//g, "\\") + Store.state.Explorer.project.resource_pack + "\\", "").replace(/\\/g, "/");
                    return `${path.dirname(tmp)}/${path.basename(tmp, path.extname(tmp))}`;
                });
            } catch(e) { return []; }
        },
        model_png() {
            try {
                return walkSync(path.join(CURRENT.RP_PATH, "/textures/models")).map(e => {
                    let tmp = e.replace(RP_BASE_PATH.replace(/\//g, "\\") + Store.state.Explorer.project.resource_pack + "\\", "").replace(/\\/g, "/");
                    return `${path.dirname(tmp)}/${path.basename(tmp, path.extname(tmp))}`;
                });
            } catch(e) { return []; }
        },
        sound_file() {
            try {
                return walkSync(path.join(CURRENT.RP_PATH, "/sounds")).map(e => {
                    let tmp = e.replace(RP_BASE_PATH.replace(/\//g, "\\") + Store.state.Explorer.project.resource_pack + "\\", "").replace(/\\/g, "/");
                    return `${path.dirname(tmp)}/${path.basename(tmp, path.extname(tmp))}`;
                }).filter(e => !e.endsWith(".json"));
            } catch(e) { return []; }
        },
        sound_definition() {
            try {
                return Object.keys(readJSONSync(path.join(CURRENT.RP_PATH, "/sounds/sound_definitions.json")).texture_data);
            } catch(e) { return []; }
        }
    },
    animation_controller_ids() {
        return LightningCache.getCompiledSync().animation_controller.ids;
    },
    animation_ids() {
        return LightningCache.getCompiledSync().animation.ids;
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
            return walkSync(CURRENT.PROJECT_PATH + "\\loot_tables").map(e => {
                return e.replace(BASE_PATH.replace(/\//g, "\\") + Store.state.Explorer.project.explorer + "\\", "").replace(/\\/g, "/");
            });
        } catch(e) { return []; }
    },
    trade_table_files() {
        try {
            return walkSync(CURRENT.PROJECT_PATH + "\\trading").map(e => {
                return e.replace(BASE_PATH.replace(/\//g, "\\") + Store.state.Explorer.project.explorer + "\\", "").replace(/\\/g, "/");
            });
        } catch(e) { return []; }
    },
    function_files() {
        try {
            return walkSync(CURRENT.PROJECT_PATH + "\\functions").map(e => {
                return e.replace(BASE_PATH.replace(/\//g, "\\") + Store.state.Explorer.project.explorer + "\\functions\\", "").replace(/\\/g, "/").replace(".mcfunction", "");
            });
        } catch(e) { return []; }
    }
};