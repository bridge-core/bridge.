<template>
	<v-layout>
		<v-layout
			column
			:style="`padding: 2em; height: ${available_height}px;`"
		>
			<v-layout @dblclick="createFile" justify-center>
				<h1>Welcome to bridge.</h1>
				<br />
				<br />
			</v-layout>
			<v-container fluid class="pb-12">
				<v-row>
					<!---Need Help Card-->
					<v-card
						tile
						class="mx-auto"
						min-width="250"
						max-width="300"
						height="450"
						elevation="14"
						color="sidebar_navigation"
					>
						<v-card-title>Need Help?</v-card-title>
						<v-layout align-center justify-center>
							<div>
								<p class="pt-2">
									<v-tooltip bottom color="#7289DA">
										<template
											v-slot:activator="{ on, attrs }"
										>
											<v-btn
												class="mx-2"
												fab
												dark
												x-large
												color="#7289DA"
												@click="openDiscord"
											>
												<v-icon
													dark
													v-bind="attrs"
													v-on="on"
												>
													mdi-discord
												</v-icon>
											</v-btn>
										</template>
										<span>Join Our Discord Server!</span>
									</v-tooltip>
								</p>
								<p class="pt-10">
									<v-tooltip bottom color="secondary">
										<template
											v-slot:activator="{ on, attrs }"
										>
											<v-btn
												class="mx-2"
												fab
												dark
												x-large
												color="secondary"
												@click="openBedrockGuide"
											>
												<v-icon
													dark
													v-bind="attrs"
													v-on="on"
												>
													mdi-book-open-variant
												</v-icon>
											</v-btn>
										</template>
										<span
											>Check Out These Addon Guides!</span
										>
									</v-tooltip>
								</p>
								<p class="pt-10">
									<v-tooltip bottom color="primary">
										<template
											v-slot:activator="{ on, attrs }"
										>
											<v-btn
												class="mx-2"
												fab
												dark
												x-large
												color="primary"
												@click="openBedrockWiki"
											>
												<v-icon
													dark
													v-bind="attrs"
													v-on="on"
												>
													mdi-earth
												</v-icon>
											</v-btn>
										</template>
										<span>Check Out This Addon Wiki!</span>
									</v-tooltip>
								</p>
							</div>
						</v-layout>
					</v-card>
					<!---Features Card-->
					<v-card
						tile
						class="mx-auto"
						min-width="250"
						max-width="300"
						height="465"
						elevation="14"
						color="sidebar_navigation"
					>
						<v-card-title>Features</v-card-title>
						<v-expansion-panels tile>
							<v-expansion-panel>
								<v-expansion-panel-header>
									<v-icon>mdi-auto-fix</v-icon>
									<span>Syntax highlighting</span>
								</v-expansion-panel-header>
								<v-expansion-panel-content>
									Beautiful syntax highlighting for all files
								</v-expansion-panel-content>
							</v-expansion-panel>
							<v-expansion-panel>
								<v-expansion-panel-header>
									<v-icon>mdi-format-list-bulleted</v-icon>
									<span>Rich auto-completions</span>
								</v-expansion-panel-header>
								<v-expansion-panel-content>
									We provide hand-written auto-completions for
									every JSON, lang and mcfunction file!
								</v-expansion-panel-content>
							</v-expansion-panel>
							<v-expansion-panel>
								<v-expansion-panel-header>
									<v-icon>mdi-folder-multiple</v-icon>
									<span>Easy project mangement</span>
								</v-expansion-panel-header>
								<v-expansion-panel-content>
									Creating addons is easy with bridge.. You
									can create new behaviour and resource packs
									with an automatically generated manifest and
									when your done you can package your project
									with just one click!
								</v-expansion-panel-content>
							</v-expansion-panel>
							<v-expansion-panel>
								<v-expansion-panel-header>
									<v-icon>mdi-package-variant</v-icon>
									<span>Custom components</span>
								</v-expansion-panel-header>
								<v-expansion-panel-content>
									With custom entity components you can write
									Javascript to make your own components with
									custom arguments.
								</v-expansion-panel-content>
							</v-expansion-panel>
							<v-expansion-panel>
								<v-expansion-panel-header>
									<v-icon>mdi-console-line</v-icon>
									<span>Custom commands</span>
								</v-expansion-panel-header>
								<v-expansion-panel-content>
									With custom commands you can write
									Javascript to make custom commands and
									target selctors that can be used in
									.mcfunction files.
								</v-expansion-panel-content>
							</v-expansion-panel>
							<v-expansion-panel>
								<v-expansion-panel-header>
									<v-icon>mdi-cog</v-icon>
									<span>Collection of settings</span>
								</v-expansion-panel-header>
								<v-expansion-panel-content>
									With bridge., you get to choose from a
									collection of settings that can affect the
									look of bridge., the format of JSON files,
									and much more!
								</v-expansion-panel-content>
							</v-expansion-panel>
							<v-expansion-panel>
								<v-expansion-panel-header>
									<v-icon>mdi-cube-outline</v-icon>
									<span>OBJ model converter</span>
								</v-expansion-panel-header>
								<v-expansion-panel-content>
									The OBJ to JSON model converter can be used
									to easily convert OBJ models to be used in
									Minecraft.
								</v-expansion-panel-content>
							</v-expansion-panel>
						</v-expansion-panels>
					</v-card>
					<!---Customize Card-->
					<v-card
						tile
						class="mx-auto"
						min-width="250"
						max-width="300"
						height="450"
						elevation="14"
						color="sidebar_navigation"
					>
						<v-card-title>Customize Your Experience</v-card-title>
						<p>
							With Plugins You Can Customize Your Experience With
							bridge.!
						</p>
						<ul class="pr-3">
							<title>What you can do:</title>
							<br />
							<header>You can create/download new...</header>
							<li>
								<v-icon>mdi-palette</v-icon>
								<span>Themes</span>
							</li>
							<li>
								<v-icon>mdi-attachment</v-icon>
								<span>Snippets</span>
							</li>
							<li>
								<v-icon>mdi-text-box-multiple-outline</v-icon>
								<span>Presets</span>
							</li>
							<li>
								<v-icon>mdi-menu</v-icon>
								<span>UI Elements</span>
							</li>
							<li>
								<v-icon>mdi-format-list-bulleted-square</v-icon>
								<span>And Much More!</span>
							</li>
						</ul>
						<p class="pt-14">
							<v-btn
								rounded
								large
								dark
								color="primary"
								@click="openExtensionBrowser"
							>
								<v-icon>mdi-puzzle</v-icon>
								<span>Open Extension Store</span>
							</v-btn>
						</p>
					</v-card>
				</v-row>
			</v-container>
		</v-layout>
	</v-layout>
</template>

<script>
import CreateFileWindow from '../../../windows/CreateFile'
import DiscordWindow from '../../../windows/Discord'
import { shell } from 'electron'
import ExtensionBrowser from '../../../windows/Extensions/Browser'

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
		openExtensionBrowser(event) {
			new ExtensionBrowser()
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
