# @bridge/ui

Module that provides programmatic access to Vue components defined of the plugin's `ui/` folder

## `UI.BuiltIn`

bridge. ships with a couple of built-in components for you to use:

### `BuiltIn.BaseWindow`

A helper for quickly creating windows

#### Props:

```javascript
{
	isFullscreen: Boolean,
	isVisible: Boolean,
	isPersistent: Boolean,
	blurBackground: {
		type: Boolean,
		default: true,
	},
	hideToolbar: Boolean,
	windowTitle: String,
	hasCloseButton: {
		type: Boolean,
		default: true,
	},
	hasMaximizeButton: {
		type: Boolean,
		default: true,
	},
	width: {
		type: Number,
		default: 1600,
	},
	maxWidth: {
		type: Number,
		default: 1600,
	},
	height: {
		type: Number,
		default: 800,
	},
	maxHeight: {
		type: Number,
		default: 800,
    },
}
```

#### Example Usage:

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
			[MAIN CONTENT]
		</template>
		<template #actions>
			[ACTION CONTENT]
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
