<template>
	<v-system-bar color="toolbar" fixed app clipped padless height="24px">
		<img style="height: 16px; padding-right: 8px;" :src="imgSrc" />
		<v-divider vertical />

		<!-- App menu buttons -->
		<v-toolbar-items class="px14-font">
			<template
				v-for="({ displayName, displayIcon, elements, onClick },
				key) in AppMenu"
			>
				<MenuButton
					v-if="typeof onClick === 'function'"
					:key="`button.${key}`"
					:displayIcon="displayIcon"
					:displayName="displayName"
					@click="onClick"
				/>
				<MenuActivator
					v-else
					:key="`activator.${key}`"
					:displayName="displayName"
					:displayIcon="displayIcon"
					:elements="
						typeof elements === 'function' ? elements() : elements
					"
				/>
				<v-divider :key="`divider.${key}`" vertical />
			</template>
		</v-toolbar-items>

		<v-spacer />
		<span v-if="projectName" style="font-size: 12px;">
			{{ projectName.split(/\\|\//g).pop() }}
		</span>
		<v-spacer />

		<!-- Main buttons to interact with the app window -->
		<v-divider vertical />
		<v-toolbar-items class="px14-font">
			<template v-for="({ icon, action, color }, i) in windowActions">
				<WindowAction
					:icon="icon"
					:action="action"
					:color="color"
					:key="`windowAction.${icon}`"
				/>
				<v-divider
					v-if="i + 1 < windowActions.length"
					:key="`divider.${icon}`"
					vertical
				/>
			</template>
		</v-toolbar-items>
	</v-system-bar>
</template>

<script>
import WindowAction from './WindowAction'
import MenuActivator from './Menu/Activator'
import MenuButton from './Menu/Button'
import { AppMenu } from './state'
import { remote } from 'electron'
import { join } from 'path'

export default {
	name: 'Toolbar',
	components: {
		WindowAction,
		MenuActivator,
		MenuButton,
	},
	data: () => ({
		AppMenu,

		imgSrc: join(__static, 'icon.png'),
		windowActions: [
			{
				icon: 'mdi-minus',
				action: () => remote.getCurrentWindow().minimize(),
			},
			{
				icon: 'mdi-plus',
				action: () => remote.getCurrentWindow().maximize(),
			},
			{
				icon: 'mdi-close',
				color: 'error',
				action: () => remote.getCurrentWindow().close(),
			},
		],
	}),
	computed: {
		projectName() {
			return this.$store.state.Explorer.project.explorer
		},
	},
}
</script>

<style scoped>
.v-system-bar {
	-webkit-app-region: drag;
	padding-right: 0;
}

.toolbar-btn {
	-webkit-app-region: no-drag;
	min-width: 0;
}
</style>
