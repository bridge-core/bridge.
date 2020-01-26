<template>
	<div>
		<!-- <keep-alive> -->
		<content-explorer
			v-if="menu_type === 'explorer'"
			key="explorer"
			explorer_type="explorer"
			:base_path="BASE_PATH"
			:load_plugins="true"
		/>
		<content-explorer
			v-else-if="menu_type === 'resource_pack'"
			key="resource_pack"
			explorer_type="resource_pack"
			:base_path="RP_BASE_PATH"
			:load_plugins="false"
			:force_project_algorithm="findRP"
			toolbar_component="explorer-rp-toolbar"
		/>
		<content-plugins v-else-if="menu_type === 'extensions'" />
		<content-debug-log v-else-if="menu_type === 'debug_log'" />
		<content-documentation v-else-if="menu_type === 'documentation'" />

		<content-file-search v-else-if="menu_type === 'file_search'" />

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
import ContentExplorer from './content/Explorer'
import ContentDocumentation from './content/Documentation'
import ContentPlugins from './content/Plugins'
import ContentDebugLog from './content/DebugLog'
import ContentCustom from './content/Custom'
import ContentNotImplemented from './content/NotImplemented'
import ContentFileSearch from './content/FileSearch'

import { BASE_PATH, RP_BASE_PATH } from '../../scripts/constants'
import findRP from '../../scripts/Utilities/FindRP'

export default {
	name: 'sidebar-content',
	props: {
		sidebar: Object,
		menu_type: String,
	},
	components: {
		ContentExplorer,
		ContentPlugins,
		ContentDebugLog,
		ContentCustom,
		ContentDocumentation,
		ContentFileSearch,
		ContentNotImplemented,
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
