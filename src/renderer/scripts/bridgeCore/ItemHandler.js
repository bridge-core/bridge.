import { JSONFileMasks } from "../editor/JSONFileMasks";
import { CURRENT } from "../constants";
import path from "path";
import { set } from "../utilities/useAttr";

export function transformComponents({ MASK, component_name, component, file_uuid }) {
    if(component_name === "bridge:attack_damage") {
        MASK.set("item_components", {
            "minecraft:entity": {
                "component_groups": {
                    ["bridge:holds_" + file_uuid]: {
                        "minecraft:attack": {
                            "damage": component
                        }
                    }
                }
            }
        })
    }
}

export default async function ItemHandler({ file_uuid, data }) {
    let player_file = path.join(CURRENT.PROJECT_PATH, "entities/player.json");
    let item = data["minecraft:item"];
    if(!item) return;
    set(item, "components", {});
    let { components } = item;
    let MASK = await JSONFileMasks.get(player_file);

    for(let c in components) transformComponents({ component_name: c, component: components[c], MASK, file_uuid });
    await JSONFileMasks.apply(player_file);
    await JSONFileMasks.saveMasks();
}