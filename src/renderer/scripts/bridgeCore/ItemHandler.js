import { JSONFileMasks } from "../editor/JSONFileMasks";
import { CURRENT } from "../constants";
import path from "path";
import { set } from "../utilities/useAttr";
import AnimationController from "../files/AnimationController";

export function transformComponents({ MASK, A_C, component_name, component, identifier, file_uuid }) {
    let item_id = identifier.split(":").pop();

    if(component_name === "bridge:attack_damage") {
        set(A_C, "animation_controllers/controller.animation.bridge_custom_item_behavior/states/default", {
            transitions: [ { ["holds_" + item_id]: "query.get_equipped_item_name(0, 0) == '" + item_id + "'" } ]
        });
        set(A_C, "animation_controllers/controller.animation.bridge_custom_item_behavior/states/holds_" + item_id, {
            transitions: [ { default: "query.get_equipped_item_name(0, 0) != '" + item_id + "'" } ],
            on_exit: [
                "@s bridge:on_reset_player"
            ],
            on_entry: [
                "@s bridge:on_equipped_" + file_uuid
            ]
        });
        MASK.set("item_components", {
            "minecraft:entity": {
                "description": {
                    "animations": {
                        "bridge_custom_item_behavior": "controller.animation.bridge_custom_item_behavior"
                    },
                    "scripts": {
                        "animate": [
                            "bridge_custom_item_behavior"
                        ]
                    }
                },
                "component_groups": {
                    "bridge:default_player": {
                        "minecraft:attack": {
                            "damage": 1
                        }
                    },
                    ["bridge:equipped_" + file_uuid]: {
                        "minecraft:attack": {
                            "damage": component
                        }
                    }
                },
                "events": {
                    "bridge:on_reset_player": {
                        "remove": { "component_groups": [ "bridge:equipped_" + file_uuid ] },
                        "add": { "component_groups": [ "bridge:default_player" ] }
                    },
                    ["bridge:on_equipped_" + file_uuid]: {
                        "add": { "component_groups": [ "bridge:equipped_" + file_uuid ] }
                    }
                }
            }
        });
    }
}

export default async function ItemHandler({ file_uuid, data }) {
    //FILE PATHS
    let player_file_path = path.join(CURRENT.PROJECT_PATH, "entities/player.json");
    let a_c_file_path = path.join(CURRENT.PROJECT_PATH, `animation_controllers/bridge/custom_items.json`);

    //DATA
    let item = data["minecraft:item"];
    if(!item) return;
    set(item, "components", {});
    set(item, "description", {});
    let { components, description } = item;

    //ADDITIONAL FILES
    let MASK = await JSONFileMasks.get(player_file_path);
    let A_C = new AnimationController();
    await A_C.load(a_c_file_path);
    
    //READ COMPONENTS
    for(let c in components) transformComponents({ component_name: c, component: components[c], identifier: description.identifier, MASK, A_C, file_uuid });

    //SAVE ADDITIONAL FILES
    await JSONFileMasks.apply(player_file_path);
    await JSONFileMasks.saveMasks();
    await A_C.save(a_c_file_path);
}