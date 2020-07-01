<template>
	<v-layout
		:style="`padding: 10em; height: ${available_height}px;`"
		@dblclick="createFile"
		column
	>
		<h1>Welcome to bridge.</h1>
		<div>
			<br />
			<p>Creating Minecraft addons has never been more convenient!</p>
			<ul>
				<li>
					<v-icon small>mdi-auto-fix</v-icon>
					<span>Syntax highlighting</span>
				</li>
				<li>
					<v-icon small>mdi-format-list-bulleted</v-icon>
					<span>Rich auto-completions</span>
				</li>
				<li>
					<v-icon small>mdi-folder-multiple</v-icon>
					<span>Easy project management</span>
				</li>
				<li>
					<v-icon small>mdi-code-json</v-icon>
					<span>Custom addon syntax</span>
				</li>
				<li>
					<v-icon small>mdi-nodejs</v-icon>
					<span>Customizable through plugins</span>
				</li>
			</ul>
		</div>
		<br />
		<br />
		<br />
		<br />
		<h2>Need Help?</h2>
		<br />
		<div>
			<v-tooltip bottom color="accent">
				<template v-slot:activator="{ on, attrs }">
					<v-btn
						class="mx-2"
						fab
						dark
						color="#7289DA"
						@click="openDiscord"
					>
						<v-icon dark v-bind="attrs" v-on="on">
							mdi-discord
						</v-icon>
					</v-btn>
				</template>
				<span>Join Our Discord Server!</span>
			</v-tooltip>

			<v-tooltip bottom color="accent">
				<template v-slot:activator="{ on, attrs }">
					<v-btn
						class="mx-2"
						fab
						dark
						color="secondary"
						@click="openBedrockGuide"
					>
						<v-icon dark v-bind="attrs" v-on="on">
							mdi-book-open-variant
						</v-icon>
					</v-btn>
				</template>
				<span>Check Out These Addon Guides!</span>
			</v-tooltip>
			<v-tooltip bottom color="accent">
				<template v-slot:activator="{ on, attrs }">
					<v-btn
						class="mx-2"
						fab
						dark
						color="primary"
						@click="openBedrockWiki"
					>
						<v-icon dark v-bind="attrs" v-on="on">
							mdi-earth
						</v-icon>
					</v-btn>
				</template>
				<span>Check Out This Addon Wiki!</span>
			</v-tooltip>
		</div>
	</v-layout>
</template>

<script>
import CreateFileWindow from '../../../windows/CreateFile'
import DiscordWindow from '../../../windows/Discord'
import { shell } from 'electron'

export default {
	name: 'welcome-screen',
	props: {
		available_height: Number,
	},
	methods: {
		createFile(event) {
			new CreateFileWindow(undefined, false)
		},
		openDiscord(event) {
			new DiscordWindow(() => {
				shell.openExternal('https://discord.gg/jj2PmqU')
			})
		},
		openBedrockGuide(event) {
			shell.openExternal('https://guide.bedrock.dev')
		},
		openBedrockWiki(event) {
			shell.openExternal('https://wiki.bedrock.dev')
		},
	},
}
</script>

<style scoped>
div,
li {
	list-style-type: none;
	text-align: center;
}
span {
	margin-left: 4px;
}
</style>
