# Custom Commands

bridge. allows you to define new commands that can be used in mcfunction files. In order to get started, create a `commands/` folder inside of your project or a `<PLUGIN NAME>/commands` inside of your plugin folder and place a first JavaScript (.js) file inside of it. The name of the file does not matter.

### Execution Scope

JavaScript files placed inside of this folder have access to the `Bridge` object. Available methods:

-   `Bridge.register`: registers a custom command. This method expects a JavaScript class with a static property `command_name` and the two instance methods `onApply(command_args)` & `onPropose()`.

### `onApply(command_args)`

`onApply(command_args)` receives all arguments a user calls the command with (`command_args`). The method must return a string or a string array.

### `onPropose()`

`onPropose()` must return an auto-completion object. It should only have one property (named your custom command name) which should replicate the structure of the command. [Read more about bridge.'s auto-completion JSON format.](https://github.com/solvedDev/bridge./blob/master/plugin_docs/auto_completions/main.md)

### Example

```javascript
Bridge.register(
	class Command {
		static command_name = 'setupTags'

		onApply([selector, ...tags]) {
			return tags.map(t => `tag ${selector} add ${t}`)
		}

		onPropose() {
			return {
				[Command.command_name]: {
					'$function.general.target_selector': {},
				},
			}
		}
	}
)
```
