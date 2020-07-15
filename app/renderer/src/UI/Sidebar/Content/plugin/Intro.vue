<template>
	<v-card color="expanded_sidebar">
		<v-card-text>
			<p>
				Customize Your bridge. Experience With Plugins!
			</p>
			<ul style="list-style: none;">
				<li>
					<v-icon color="accent" small> mdi-palette </v-icon>
					<span>Themes</span>
				</li>
				<li>
					<v-icon color="accent" small> mdi-attachment </v-icon>
					<span>Snippets</span>
				</li>
				<li>
					<v-icon color="accent" small>
						mdi-text-box-multiple-outline
					</v-icon>
					<span>Presets</span>
				</li>
				<li>
					<v-icon color="accent" small> mdi-menu </v-icon>
					<span>UI Elements</span>
				</li>
				<li>
					<v-icon color="accent" small>
						mdi-format-list-bulleted-square
					</v-icon>
					<span>And Much More!</span>
				</li>
			</ul>
		</v-card-text>

		<v-card-actions style="display: grid; place-items: center;">
			<v-btn rounded dark color="primary" @click="openExtensionBrowser">
				<v-icon>mdi-puzzle</v-icon>
				<span>View Extensions</span>
			</v-btn>
		</v-card-actions>
	</v-card>
</template>

<script>
import ExtensionBrowser from '../../../../../windows/Extensions/Browser'

export default {
	name: 'PluginIntro',
	methods: {
		openExtensionBrowser(event) {
			new ExtensionBrowser()
		},
	},
}
</script>
