export default [
    {
        "Blank Entity": {
            "minecraft:entity": {
                "format_version": {},
                "description": {
                    "identifier": "",
                    "runtime_identifier": ""
                },
                "component_groups": {},
                "components": {},
                "events": {}
            }
        }
    },
    {
        "Blank Trade Table": {
            tiers: [
                {
                    trades: [
                        {
                            wants: [
                                {
                                    item: "",
                                    quantity: {}
                                },
                                {
                                    item: "",
                                    quantity: {}
                                }
                            ],
                            gives: [
                                {
                                    item: "",
                                    quantity: {}
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    },
    {
        "Blank Loot Table": {
            pools: [
                {
                    rolls: {},
                    entries: [
                        {
                            type: "item",
                            name: "",
                            weight: {},
                            functions: [
                                {
                                    "function": ""
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    },
    {
        "Example Function": "# My Comment\nsay Hello World!"
    },
    {
        "Blank Spawn Rule": {
            "format_version": {},
            "minecraft:spawn_rules": {
                "description": {
                    "identifier": "",
                    "population_control": ""
                },
                "conditions": [
                    {
                        
                    }
                ]
            }
        }
    },
    {
        "Blank Animation": {
            "format_version": {},
            "animations": {
                "animation.test_events": {
                    "timeline": {
                        "0.0": []
                    },
                    "animation_length": {}
                }
            }
        }
    },
    {
        "Blank Animation Controller": {
            "format_version": {},
            "animation_controllers": {
                "controller.animation.blank": {
                    "states": {
                        "default": {
                            "on_entry": [],
                            "on_exit": []
                        }
                    }
                }
            }
        }
    },
    {
        "Script Start": "let system = <server|client>.registerSystem(0,0);\n\nsystem.initialize = function() {};\nsystem.update = function () {};"
    }
];