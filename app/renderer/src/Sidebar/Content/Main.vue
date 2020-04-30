<template>
	<div>
		<!-- <keep-alive> -->
		<content-explorer
			v-if="componentName === 'BehaviorPack'"
			key="explorer"
			explorer_type="explorer"
			:base_path="BASE_PATH"
			:load_plugins="true"
		/>
		<content-explorer
			v-else-if="componentName === 'ResourcePack'"
			key="resource_pack"
			explorer_type="resource_pack"
			:base_path="RP_BASE_PATH"
			:load_plugins="false"
			:force_project_algorithm="findRP"
			toolbar_component="explorer-rp-toolbar"
		/>
		<content-plugins v-else-if="componentName === 'Extensions'" />
		<content-debug-log v-else-if="componentName === 'DebugLog'" />
		<content-documentation v-else-if="componentName === 'Documentation'" />

		<content-file-search v-else-if="componentName === 'file_search'" />
		<content-vanilla-assets v-else-if="componentName === 'VanillaPacks'" />

		<content-custom
			v-else-if="sidebar.is_plugin"
			:content="sidebar.content"
			:toolbar="sidebar.toolbar"
		/>
		<content-not-implemented v-else />
		<!-- </keep-alive> -->
	</div>
</template>

<script>
import ContentExplorer from './Explorer'
import ContentDocumentation from './Documentation'
import ContentPlugins from './Plugins'
import ContentDebugLog from './DebugLog'
import ContentCustom from './Custom'
import ContentNotImplemented from './NotImplemented'
import ContentFileSearch from './FileSearch'
import ContentVanillaAssets from './VanillaAssets'

import { BASE_PATH, RP_BASE_PATH } from '../../../src/constants'
import findRP from '../../../src/Utilities/FindRP'

export default {
	name: 'SidebarContent',
	props: {
		sidebar: Object,
		componentName: String,
	},
	components: {
		ContentExplorer,
		ContentPlugins,
		ContentDebugLog,
		ContentCustom,
		ContentDocumentation,
		ContentFileSearch,
		ContentNotImplemented,
		ContentVanillaAssets,
	},
	data() {
		return {
			BASE_PATH,
			RP_BASE_PATH,
			findRP,
		}
	},
}
</script>
