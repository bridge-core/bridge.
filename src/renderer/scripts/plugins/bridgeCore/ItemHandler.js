import { JSONFileMasks } from "../../editor/JSONFileMasks";
import { CURRENT } from "../../constants";
import path from "path";

export function transformComponents({ MASK, component_name, component }) {
    if(component_name === "bridge:attack_damage") {
        MASK.set("item_components", {
            "minecraft:entity": {

            }
        })
    }
}

export default async function ItemHandler(file_name, data) {
    let item = data["minecraft:item"];
    if(!item) return;
    set(item, "components", {});
    let { components } = item;
    let MASK = await JSONFileMasks.getMask(path.join(CURRENT.PROJECT_PATH, "entities/player.json"));
    MASK.reset("item_components");

    for(let c in components) transformEvent(events[e], { component_name: c, component: components[c], MASK });
}