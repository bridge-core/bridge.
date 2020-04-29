# Custom Components

bridge. allows you to define new entity components. In order to get started, create a `components/` folder inside of your project or a `<PLUGIN NAME>/components` inside of your plugin folder and place a first JavaScript (.js) file inside of it. The name of the file does not matter.

### Execution Scope

JavaScript files placed inside of this folder have access to the `Bridge` object. Available methods:

-   `Bridge.register` and it is used to register a custom component. This method expects a JavaScript class with a static property `component_name` and the two instance methods `onApply(component_data, location)` & `onPropose()`.
-   `Bridge.report(string)` opens an information window that contains the given string

### `onApply(component_data, location)`

`onApply(component_data, location)` receives the `component_data` entered by the user and where the component was placed (`location`). Can be "components" or the name of a component group. This method must return an entity object to merge with the actual file. Must return a Minecraft entity.

### `onPropose()`

`onPropose()` must return an auto-completion object. It should only have one property (named your custom component name) which should replicate the structure of the custom component. [Read more about bridge.'s auto-completion JSON format.](https://github.com/solvedDev/bridge./blob/master/plugin_docs/auto_completions/main.md)

### Example

```javascript
Bridge.register(
	class DemoComponent {
		static component_name = 'bridge:demo_npc'

		onApply({ trade_table, display_name }, location) {
			return {
				'minecraft:entity': {
					component_groups: {
						[DemoComponent.component_name]: {
							'minecraft:trade_table': {
								display_name: display_name,
								table: trade_table,
							},
							'minecraft:behavior.trade_with_player': {
								priority: 1,
							},
							'minecraft:behavior.look_at_trading_player': {
								priority: 2,
							},
						},
					},
				},
			}
		}

		onPropose() {
			return {
				[DemoComponent.component_name]: {
					display_name: '$general.translatable_text',
					trade_table: '$dynamic.trade_table_files',
				},
			}
		}
	}
)
```
