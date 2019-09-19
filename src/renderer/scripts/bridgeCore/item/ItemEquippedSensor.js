export default function ItemEquippedSensor({ A_C_MASK, component, file_uuid, item_id }) {
    A_C_MASK.set(file_uuid, {
        format_version: "1.10.0",
        animation_controllers: {
            "controller.animation.bridge_custom_item_behavior": {
                states: {
                    default: {
                        transitions: [ { ["holds_" + item_id]: `query.get_equipped_item_name(0, 0) == '${item_id}'` } ]
                    },
                    ["holds_" + item_id]: {
                        transitions: [ { default: `query.get_equipped_item_name(0, 0) != '${item_id}'` } ],
                        on_entry: (component.triggers || []).map(e => "@s " + e).concat(component.execute_commands || [])
                    }
                }
            }
        }
    }, [ "on_entry" ]);
}