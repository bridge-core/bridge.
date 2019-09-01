import { use, set, uuid } from "../../utilities/useAttr";

function transformEvent(event, component_groups, events) {
    set(event, "add/component_groups", []);

    //SPELL EFFECTS
    let effect_id = uuid();
    let add_effects = use(event, "add/spell_effects");
    if(add_effects !== undefined) {
        set(event, "add/component_groups", effect_id);
        set(component_groups, effect_id, {
            "minecraft:spell_effects": {
                "add_effects": add_effects
            }
        });
    }
    let remove_effects = use(event, "remove/spell_effects");
    if(remove_effects !== undefined) {
        if(add_effects === undefined) set(event, "add/component_groups", effect_id);
        set(component_groups, effect_id, {
            "minecraft:spell_effects": {
                "remove_effects": remove_effects
            }
        });
    }

    //GROUP
    let g = use(event, "add/group");
    if(g !== undefined) {
        let group_name = (typeof g.name !== "object" ? g.name : uuid()) || uuid();
        set(event, "add/component_groups", group_name);
        set(component_groups, group_name, g.components || {});
    }
}

export default function EntityHandler(data) {
    let e = data["minecraft:entity"];
    if(!e) return;
    set(e, "component_groups", {});
    set(e, "events", {});
    set(e, "components", {});
    let { components, component_groups, events } = e;

    for(let e in events) transformEvent(events[e], component_groups, events);
}