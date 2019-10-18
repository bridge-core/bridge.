# Custom Components
bridge. allows you to define new custom components with plugins. In order to get started, create a ```<PLUGIN NAME>/components``` folder and place a first JavaScript (.js) file inside of it. The name of the file does not matter.

### Execution Scope
JavaScript files placed inside of this folder have access to the ```Bridge``` object. The only available method on this object is called ```Bridge.register``` and it is used to register a custom component. This method expects a JavaScript class with a static property ```component_name``` and the two instance methods ```onApply(component_data)``` & ```onPropose()```.

### ```onApply(component_data)```
```onApply(component_data)``` receives the component data entered by the user. Must return an entity object to merge with the actual file.

### ```onPropose()```
```onPropose()``` must return an auto-completion object. It should only have one property (named your custom component name) which should replicate the structure of the custom component. [Read more on bridge.'s auto-completion JSON format.](https://github.com/solvedDev/bridge./blob/master/plugin_docs/auto_completions/main.md)

### Example
```javascript
Bridge.register(class DemoComponent {
    static component_name = "bridge:demo_npc";
    
    onApply({ trade_table, display_name }) {
        return {
            "minecraft:entity": {
                "component_groups": {
                    [DemoComponent.component_name]: {
                        "minecraft:trade_table": {
                            "display_name": display_name,
                            "table": trade_table
                        },
                        "minecraft:behavior.trade_with_player": {
                            "priority": 1
                        },
                        "minecraft:behavior.look_at_trading_player": {
                            "priority": 2
                        }
                    }
                }
            }
        }
    }

    onPropose() {
        return {
            [DemoComponent.component_name]: {
                "display_name": "$general.translatable_text",
                "trade_table": "$dynamic.trade_table_files"
            }
        }
    }
});
```
