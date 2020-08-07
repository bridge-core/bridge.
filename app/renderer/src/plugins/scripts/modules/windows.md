# @bridge/windows

Module that provides acess to bridge's window system

### `createInformationWindow(displayName: string, displayContent: string): IBridgeWindow`

### `createInputWindow(displayName: string, inputLabel: string, onConfirm: (input: string) => void): IBridgeWindow`

### `createWindow(vueComponent: VueComponent, state: Record<string, any>): IBridgeWindow`

A helper function that is used internally to define all app windows. You can use it to create rich, custom interfaces for your plugin.

| `IBridgeWindow` | Description                                                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `.getState()`   | Returns the window state: Maps to the state given by the user as a parameter with additional `isVisible` and `shouldRender` attributes |
| `.close()`      | Closes the window                                                                                                                      |
| `.open()`       | Opens the window                                                                                                                       |
| `.dispose()`    | Delete the window. A disposed window can no longer be rendered                                                                         |

You can use the `currentWindow` prop on the component you pass to the `createWindow` function to access the `IBridgeWindow` instance directly on your component. You also need to implement the `isVisible` and `shouldRender` attributes properly so the window reacts to the `open()` and `close()` function calls and the window becomes as efficient as possible.

#### Example Component:

```html
<template>
	<BaseWindow
		v-if="shouldRender"
		:windowTitle="windowTitle"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="440"
		:height="120"
		@closeWindow="onClose"
	>
		<template #default>
			Lorem Ipsum...
		</template>
	</BaseWindow>
</template>

<script>
	const { BuiltIn } = await require('@bridge/ui')

	export default {
		name: 'Information',
		components: {
			BaseWindow: BuiltIn.BaseWindow,
		},
		props: ['currentWindow'],
		data() {
			return this.currentWindow.getState()
		},
		methods: {
			onClose() {
				this.currentWindow.close()
			},
		},
	}
</script>
```
