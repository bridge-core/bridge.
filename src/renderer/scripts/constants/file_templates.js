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
        "Script Start": "let system = <server|client>.registerSystem(0,0);\n\nsystem.initialize = function() {};\nsystem.update = function () {};"
    }
];