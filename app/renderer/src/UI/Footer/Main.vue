<template>
	<v-footer color="footer" fixed padless app height="32px">
		<span class="footer-container">
			<!-- prettier-ignore-attribute v-for -->
			<Notification
				v-for="({
					onClick,
					onMiddleClick,
					icon,
					message,
					color,
					textColor,
					expiration,
				}, key) in NotificationStore"
				:key="key"
				style="margin-right: 4px;"
				:icon="icon"
				:message="message"
				:color="color"
				:textColor="textColor"
				:expiration="expiration"
				@click="onClick"
				@click.middle.native="onMiddleClick"
			/>
		</span>

		<v-spacer></v-spacer>
		<v-divider vertical></v-divider>
		<span
			style="padding: 0 12px; white-space: nowrap; font-size: 9px; width: 94px;"
		>
			<a class="grey--text text--lighten-1" @click="openGitHub"
				>bridge. {{ APP_VERSION }}</a
			>
		</span>
	</v-footer>
</template>

<script>
import Notification from './Notification'
import { shell } from 'electron'
import { NotificationStore } from './state'
import { APP_VERSION } from '../../constants'

export default {
	name: 'Footer',
	components: {
		Notification,
	},
	data: () => ({
		NotificationStore,
		APP_VERSION,
	}),
	methods: {
		openGitHub() {
			shell.openExternal('https://bridge-core.github.io/')
		},
	},
}
</script>

<style scoped>
*::-webkit-scrollbar {
	width: 4px;
	height: 4px;
}
.footer-container {
	padding: 4px 12px 2px 12px;
	overflow-x: auto;
	overflow-y: hidden;
	height: 100%;
	width: calc(100% - 95px);
	white-space: nowrap;
}
</style>
