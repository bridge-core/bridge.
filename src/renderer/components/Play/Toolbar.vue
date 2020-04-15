<template>
	<v-system-bar color="toolbar">
		<img
			v-if="!isMacOs && !noLogoDisplay"
			:src="iconPath"
			style="height: 16px; padding-right: 4px;"
		/>

		<v-toolbar-items>
			<v-divider vertical />
			<!-- <v-btn @click="PlayState.isVisible = false" small text>
				<v-icon>mdi-chevron-left</v-icon>
				Back
			</v-btn> -->
		</v-toolbar-items>

		<v-spacer />
		<span v-if="projectName" style="font-size: 12px;">
			{{ projectName.split(/\\|\//g).pop() }}
		</span>
		<v-spacer />

		<v-toolbar-items>
			<v-divider vertical />
			<v-btn
				color="error"
				small
				icon
				@click.stop="PlayState.isVisible = false"
			>
				<v-icon small>mdi-close</v-icon>
			</v-btn>
		</v-toolbar-items>
	</v-system-bar>
</template>

<script>
import { join } from 'path'
import { PlayState } from '../../scripts/Play/state'
import TabSystem from '../../scripts/TabSystem'
import { remote } from 'electron'

export default {
	name: 'PlayToolbar',

	data: () => ({
		PlayState,
		iconPath: join(__static, '/icon.png'),
	}),

	computed: {
		isMacOs() {
			return process.platform === 'darwin'
		},
		noLogoDisplay() {
			return this.$store.state.Appearance.options.no_logo_display
		},
		projectName() {
			return this.$store.state.Explorer.project.explorer
		},
	},
}
</script>

<style>
.v-btn {
	-webkit-app-region: no-drag;
	min-width: 0;
	padding: 0;
}
</style>
