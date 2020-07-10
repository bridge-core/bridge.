<template>
	<v-layout>
		<v-layout
			column
			:style="`padding: 2em; height: ${available_height}px;`"
		>
			<v-layout @dblclick="createFile" justify-center class="pt-1">
				<h1>Welcome to bridge.</h1>
				<br />
				<br />
			</v-layout>
			<v-container>
				<v-row>
					<v-carousel
						continuous
						class="mx-16 my-auto"
						hide-delimiter-background
						height="600"
						:light="!is_dark_mode"
					>
						<!---Features Card-->
						<v-carousel-item>
							<v-card
								class="mx-auto mt-2"
								min-width="270"
								max-width="300"
								height="410"
								color="background"
							>
								<v-card-title class="ml-16 pl-9"
									>Features</v-card-title
								>
								<v-expansion-panels accordion flat>
									<v-expansion-panel>
										<v-expansion-panel-header
											color="background"
										>
											<v-icon small>mdi-auto-fix</v-icon>
											<span>Syntax highlighting</span>
										</v-expansion-panel-header>
										<v-expansion-panel-content
											color="background"
										>
											Beautiful syntax highlighting for
											all files
										</v-expansion-panel-content>
									</v-expansion-panel>
									<v-expansion-panel>
										<v-expansion-panel-header
											color="background"
										>
											<v-icon small
												>mdi-format-list-bulleted</v-icon
											>
											<span>Rich auto-completions</span>
										</v-expansion-panel-header>
										<v-expansion-panel-content
											color="background"
										>
											We provide hand-written
											auto-completions for every JSON,
											lang and mcfunction file!
										</v-expansion-panel-content>
									</v-expansion-panel>
									<v-expansion-panel>
										<v-expansion-panel-header
											color="background"
										>
											<v-icon small
												>mdi-folder-multiple</v-icon
											>
											<span>Easy project mangement</span>
										</v-expansion-panel-header>
										<v-expansion-panel-content
											color="background"
										>
											Creating addons is easy with
											bridge.. You can create new
											behaviour and resource packs with an
											automatically generated manifest and
											when your done you can package your
											project with just one click!
										</v-expansion-panel-content>
									</v-expansion-panel>
									<v-expansion-panel>
										<v-expansion-panel-header
											color="background"
										>
											<v-icon small
												>mdi-package-variant</v-icon
											>
											<span>Custom components</span>
										</v-expansion-panel-header>
										<v-expansion-panel-content
											color="background"
										>
											With custom entity components you
											can write Javascript to make your
											own components with custom
											arguments.
										</v-expansion-panel-content>
									</v-expansion-panel>
									<v-expansion-panel>
										<v-expansion-panel-header
											color="background"
										>
											<v-icon small
												>mdi-console-line</v-icon
											>
											<span>Custom commands</span>
										</v-expansion-panel-header>
										<v-expansion-panel-content
											color="background"
										>
											With custom commands you can write
											Javascript to make custom commands
											and target selctors that can be used
											in .mcfunction files.
										</v-expansion-panel-content>
									</v-expansion-panel>
									<v-expansion-panel>
										<v-expansion-panel-header
											color="background"
										>
											<v-icon small>mdi-cog</v-icon>
											<span>Collection of settings</span>
										</v-expansion-panel-header>
										<v-expansion-panel-content
											color="background"
										>
											With bridge., you get to choose from
											a collection of settings that can
											affect the look of bridge., the
											format of JSON files, and much more!
										</v-expansion-panel-content>
									</v-expansion-panel>
									<v-expansion-panel>
										<v-expansion-panel-header
											color="background"
										>
											<v-icon small
												>mdi-cube-outline</v-icon
											>
											<span>OBJ model converter</span>
										</v-expansion-panel-header>
										<v-expansion-panel-content
											color="background"
										>
											The OBJ to JSON model converter can
											be used to easily convert OBJ models
											to be used in Minecraft.
										</v-expansion-panel-content>
									</v-expansion-panel>
								</v-expansion-panels>
							</v-card>
						</v-carousel-item>
						<v-carousel-item>
							<!---Need Help? Card-->
							<v-card
								class="mx-auto mt-16 pt-5"
								min-width="300"
								max-width="360"
								height="360"
								color="background"
							>
								<v-card-title class="ml-16 pl-14">
									Need Help?
								</v-card-title>
								<div class="text-center">
									<v-btn
										class="ma-5"
										rounded
										dark
										large
										color="#7289DA"
										@click="openDiscord"
									>
										<v-icon dark>
											mdi-discord
										</v-icon>
										<span>Join Our Discord Server!</span>
									</v-btn>
									<v-btn
										class="ma-5"
										rounded
										dark
										large
										color="primary"
										@click="openBedrockGuide"
									>
										<v-icon dark>
											mdi-book-open-variant
										</v-icon>
										<span
											>Check Out guide.bedrock.dev!</span
										>
									</v-btn>
									<v-btn
										class="ma-5"
										rounded
										dark
										large
										color="primary"
										@click="openBedrockWiki"
									>
										<v-icon dark>
											mdi-earth
										</v-icon>
										<span>Check Out wiki.bedrock.dev!</span>
									</v-btn>
								</div>
							</v-card>
						</v-carousel-item>
					</v-carousel>
				</v-row>
			</v-container>
		</v-layout>
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
	computed: {
		is_dark_mode() {
			return this.$store.state.Appearance.is_dark_mode
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
