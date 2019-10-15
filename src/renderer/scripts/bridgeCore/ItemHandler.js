import { JSONFileMasks } from "../editor/JSONFileMasks";
import { CURRENT } from "../constants";
import path from "path";
import { set } from "../utilities/useAttr";
import WeaponDamage from "./item/WeaponDamage";
import ItemEquippedSensor from "./item/ItemEquippedSensor";

export function transformComponents({ PLAYER_MASK, A_C_MASK, component_name, component, identifier, file_uuid }) {
    let item_id = identifier.split(":").pop();

    if(component_name === "bridge:weapon_damage") {
        WeaponDamage({ PLAYER_MASK, A_C_MASK, component_name, component, identifier, file_uuid, item_id });
    } else if(component_name === "bridge:item_equipped_sensor") {
        ItemEquippedSensor({ PLAYER_MASK, A_C_MASK, component_name, component, identifier, file_uuid, item_id });
    }
}

export default async function ItemHandler({ file_uuid, data }) {
    //FILE PATHS
    let player_file_path = path.join(CURRENT.PROJECT_PATH, "entities/player.json");
    let a_c_file_path = path.join(CURRENT.PROJECT_PATH, `animation_controllers/bridge/custom_item_behavior.json`);

    //DATA
    let item = data["minecraft:item"];
    if(!item) return;
    set(item, "components", {});
    set(item, "description", {});
    let { components, description } = item;

    //ADDITIONAL FILES
    let PLAYER_MASK = await JSONFileMasks.get(player_file_path);
    let A_C_MASK = await JSONFileMasks.get(a_c_file_path);
    A_C_MASK.reset(file_uuid);
    
    //READ COMPONENTS
    for(let c in components) {
        transformComponents({
            component_name: c,
            component: components[c],
            identifier: description.identifier || "bridge:no_identifier",
            PLAYER_MASK,
            A_C_MASK,
            file_uuid
        });
    }

    //SAVE ADDITIONAL FILES
    await Promise.all([
        JSONFileMasks.apply(player_file_path),
        JSONFileMasks.generateFromMask(a_c_file_path, [ "default/on_entry" ]),
        JSONFileMasks.saveMasks()
    ]);
}