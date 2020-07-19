<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="Discord"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="420"
		:height="80"
		@closeWindow="close"
	>
		<template #default>
			<p>Join the official bridge. Discord server!</p>
		</template>

		<template #actions>
			<v-spacer />
			<v-btn @click="close">
				<span>Later</span>
			</v-btn>
			<v-btn color="#7289DA" @click="openDiscord">
				<v-icon color="white">mdi-discord</v-icon>
				<span class="white--text">Join</span>
			</v-btn>
		</template>
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
