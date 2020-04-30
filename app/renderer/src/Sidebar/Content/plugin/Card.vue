<template>
	<v-list color="expanded_sidebar" three-line>
		<v-list-item>
			<!-- HEADER -->
			<v-list-item-content>
				<v-list-item-title>{{ plugin.name }}</v-list-item-title>
				<v-list-item-subtitle class="text--primary"
					>by {{ plugin.author }}</v-list-item-subtitle
				>
			</v-list-item-content>

			<!-- ACTIONS -->
			<v-list-item-action>
				<v-list-item-action-text>{{
					plugin.version
				}}</v-list-item-action-text>
				<v-tooltip color="error" right v-if="!plugin.id">
					<template v-slot:activator="{ on }">
						<v-icon v-on="on" color="error">
							mdi-alert-circle
						</v-icon>
					</template>
					<span>Not Loaded: No valid ID assigned</span>
				</v-tooltip>

				<v-tooltip
					color="info"
					right
					v-else-if="plugin.link !== undefined"
				>
					<template v-slot:activator="{ on }">
						<v-icon
							@click.stop.native="openLink(plugin.link)"
							v-on="on"
							color="info"
						>
							mdi-earth
						</v-icon>
					</template>
					<span>More...</span>
				</v-tooltip>
				<v-tooltip
					color="success"
					right
					v-if="plugin.id && !uninstalled_plugins.includes(plugin.id)"
				>
					<template v-slot:activator="{ on }">
						<v-icon
							@click.stop.native="deactivate"
							v-on="on"
							color="success"
						>
							mdi-check
						</v-icon>
					</template>
					<span>Active</span>
				</v-tooltip>
				<v-tooltip color="error" right v-else-if="plugin.id">
					<template v-slot:activator="{ on }">
						<v-icon
							@click.stop.native="activate"
							v-on="on"
							color="error"
						>
							mdi-close
						</v-icon>
					</template>
					<span>Inactive</span>
				</v-tooltip>
			</v-list-item-action>
		</v-list-item>

		<!-- DESCRIPTION -->
		<v-card-text>
			{{ plugin.description }}
		</v-card-text>
	</v-list>
</template>

<script>
import PluginLoader from '../../../../src/plugins/PluginLoader'
import { shell } from 'electron'
import { readJSON, writeJSON } from '../../../../src/Utilities/JsonFS'
import path from 'path'
import { CURRENT } from '../../../../src/constants'
import LoadingWindow from '../../../../windows/LoadingWindow'
import { createReloadPush } from '../../../../windows/Extensions/Common'

export default {
	name: 'plugin-card',
	props: {
		plugin: Object,
	},
	data() {
		return {
			unloaded_plugins: undefined,
		}
	},
	computed: {
		uninstalled_plugins() {
			return this.unloaded_plugins || PluginLoader.unloaded_plugins
		},
	},
	methods: {
		openLink(link) {
			shell.openExternal(link)
		},
		async activate() {
			let lw = new LoadingWindow().show()
			let plugins
			let file_path = path.join(
				CURRENT.PROJECT_PATH,
				'bridge/uninstalled_plugins.json'
			)
			try {
				plugins = await readJSON(file_path)
			} catch (e) {
				return
			}

			plugins.splice(plugins.indexOf(this.plugin.id), 1)
			this.unloaded_plugins = plugins
			await writeJSON(file_path, plugins)
			createReloadPush()
			lw.close()
		},
		async deactivate() {
			let lw = new LoadingWindow().show()
			let plugins = []
			let file_path = path.join(
				CURRENT.PROJECT_PATH,
				'bridge/uninstalled_plugins.json'
			)
			try {
				plugins = await readJSON(file_path)
			} catch (e) {}

			this.unloaded_plugins = plugins.concat([this.plugin.id])
			await writeJSON(file_path, plugins.concat([this.plugin.id]))
			createReloadPush()
			lw.close()
		},
	},
}
</script>

<style scoped>
i {
	cursor: pointer;
}
</style>
