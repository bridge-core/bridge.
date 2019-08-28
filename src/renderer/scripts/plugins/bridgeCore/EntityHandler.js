import uuid from "uuid/v4";

function transformEvent(event, component_groups, events) {
    //SPELL EFFECTS
    let id = uuid();
    if(event.add && event.add.spell_effects) {
        if(!event.add.component_groups) event.add.component_groups = [ id ];
        else event.add.component_groups.push(id);

        component_groups[id] = {
            "minecraft:spell_effects": {
                "add_effects": event.add.spell_effects
            }
        }

        delete event.add.spell_effects;
    }
    if(event.remove && event.remove.spell_effects) {
        if(!event.add.component_groups) event.add.component_groups = [ id ];
        else if(!component_groups[id]) event.add.component_groups.push(id);

        if(component_groups[id])
            component_groups[id]["minecraft:spell_effects"].remove_effects = event.remove.spell_effects;
        else 
            component_groups[id] = {
                "minecraft:spell_effects": {
                    "remove_effects": event.remove.spell_effects
                }
            }


        delete event.remove.spell_effects;
    }

    //GROUP
    if(event.add && event.add.group) {
        let group_name = event.add.group.name || uuid();
        if(!event.add.component_groups) event.add.component_groups = [ group_name ];
        else event.add.component_groups.push(group_name);

        component_groups[group_name] = event.add.group.components || {};

        delete event.add.group;
    }
}

export default function EntityHandler(data) {
    let e = data["minecraft:entity"];
    if(!e) return;
    if(!e.components) e.components = {};
    if(!e.component_groups) e.component_groups = {};
    if(!e.events) e.events = {};
    let { components, component_groups, events } = e;

    for(let e in events) transformEvent(events[e], component_groups, events);
}