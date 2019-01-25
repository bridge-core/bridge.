export default [
    {
        "Blank Entity": {
            "minecraft:entity": {
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
                                    quantity: 1
                                },
                                {
                                    item: "",
                                    quantity: 1
                                }
                            ],
                            gives: [
                                {
                                    item: "",
                                    quantity: 1
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
                    rolls: 1,
                    entries: [
                        {
                            type: "item",
                            name: "",
                            weight: 1,
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
            "format_version": "1.8.0",
            "minecraft:spawn_rules": {
                "description": {
                    "identifier": "",
                    "population_control": "ambient"
                },
                "conditions": [
                    {
                        "minecraft:height_filter": {
                            "min": 0,
                            "max": 63
                        },
                        "minecraft:weight": {
                            "default": 10
                        },
                        "minecraft:herd": {
                            "min_size": 2,
                            "max_size": 2
                        },
                        "minecraft:density_limit": {
                            "surface": 5
                        },
                        "minecraft:biome_filter": {
                            "test": "has_biome_tag", "operator":"==", "value": ""
                        }
                    }
                ]
            }
        }
    },
    {
        "Script Start": "let system = <server|client>.registerSystem(0,0);\n\nsystem.initialize = function() {};\nsystem.update = function () {};"
    }
];