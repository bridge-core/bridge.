import { PUSH_ONCE } from "../../mergeUtils";

export default function WeaponDamage({ PLAYER_MASK, A_C_MASK, component, file_uuid, item_id }) {
    A_C_MASK.set(file_uuid, {
        format_version: "1.10.0",
        animation_controllers: {
            "controller.animation.bridge_custom_item_behavior": {
                states: {
                    default: {
                        transitions: [ { ["holds_" + item_id]: `query.get_equipped_item_name(0, 0) == '${item_id}'` } ],
                        on_entry: [
                            "@s bridge:on_reset_player"
                        ]
                    },
                    ["holds_" + item_id]: {
                        transitions: [ { default: `query.get_equipped_item_name(0, 0) != '${item_id}'` } ],
                        on_entry: [
                            "@s bridge:on_equipped_" + file_uuid
                        ],
                        on_exit: [
                            "@s bridge:on_unequipped_" + file_uuid
                        ]
                    }
                }
            }
        }
    }, {
        ["holds_" + item_id + "/on_exit"]: PUSH_ONCE,
        ["holds_" + item_id + "/on_entry"]: PUSH_ONCE
    });

    PLAYER_MASK.set("item_components", {
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
                    "add": { "component_groups": [ "bridge:default_player" ] }
                },
                ["bridge:on_equipped_" + file_uuid]: {
                    "add": { "component_groups": [ "bridge:equipped_" + file_uuid ] }
                },
                ["bridge:on_unequipped_" + file_uuid]: {
                    "remove": { "component_groups": [ "bridge:equipped_" + file_uuid ] }
                }
            }
        }
    });
}