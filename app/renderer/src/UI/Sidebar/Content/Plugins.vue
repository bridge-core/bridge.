<template>
	<div>
		<v-toolbar color="expanded_sidebar" flat height="30px">
			<v-tooltip color="tooltip" bottom>
				<template v-slot:activator="{ on }">
					<v-btn
						icon
						text
						@click.stop="openInstallExtensionWindow"
						v-on="on"
						small
						class="toolbar-button"
					>
						<v-icon small>mdi-download</v-icon>
					</v-btn>
				</template>
				<span>Install</span>
			</v-tooltip>
		</v-toolbar>
		<v-divider />

		<div class="container" :style="`height: ${plugin_height}px;`">
			<PluginIntro style="margin-bottom: 8px;" />

			<v-card
				color="expanded_sidebar"
				v-for="(plugin, i) in plugins"
				style="margin-bottom: 8px;"
				:key="`${plugin.id}.${i}`"
			>
				<plugin-card :plugin="plugin" />
			</v-card>
		</div>
	</div>
</template>

<script>
import ExtensionBrowser from '../../../../windows/Extensions/Browser'
import PluginCard from './plugin/Card'
import PluginIntro from './plugin/Intro'

export default {
	name: 'content-plugins',
	components: {
		PluginCard,
		PluginIntro,
	},
	created() {
		window.addEventListener('resize', this.on_resize)
	},
	destroyed() {
		window.removeEventListener('resize', this.on_resize)
	},
	data() {
		return {
			plugin_height: window.innerHeight - 140,
		}
	},
	computed: {
		plugins() {
			return this.$store.state.Plugins.installed_plugins.filter(
				plugin => plugin !== 'unknown' && plugin !== 'module'
			)
		},
	},
	methods: {
		on_resize() {
			this.plugin_height = window.innerHeight - 140
		},

		openInstallExtensionWindow() {
			new ExtensionBrowser()
		},
	},
}
</script>

<style scoped>
div.container {
	padding: 4px;
	overflow-y: auto;
}
.toolbar-button {
	height: 28px;
	width: 28px;
}
</style>
