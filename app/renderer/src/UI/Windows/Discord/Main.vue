<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="Discord"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		isFullscreen="false"
		width="420"
		maxWidth="420"
		height="180"
		maxHeight="180"
		@closeWindow="close"
	>
		<h2>Join the official bridge. Discord server!</h2>
		<v-row align="end" justify="center" class="pt-13">
			<v-btn large class="ma-2" @click="close">
				<span>Later</span>
			</v-btn>
			<v-btn color="#7289DA" large class="ma-2" @click="openDiscord">
				<v-icon>mdi-discord</v-icon>
				<span>Join</span>
			</v-btn>
		</v-row>
	</BaseWindow>
</template>

<script>
import { Discord } from './definition'
import BaseWindow from '../Layout/Base'
import { shell } from 'electron'

export default {
	name: 'Discord',
	components: {
		BaseWindow,
	},

	data: () => Discord.getState(),
	methods: {
		close: () => Discord.close(),
		openDiscord() {
			shell.openExternal('https://discord.gg/jj2PmqU')
		},
	},
}
</script>

<style></style>
