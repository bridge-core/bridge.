<template>
	<div>
		<!-- <keep-alive> -->
		<content-explorer
			v-if="component === 'BehaviorPack'"
			key="explorer"
			explorer_type="explorer"
			:base_path="BASE_PATH"
			:load_plugins="true"
		/>
		<content-explorer
			v-else-if="component === 'ResourcePack'"
			key="resource_pack"
			explorer_type="resource_pack"
			:base_path="RP_BASE_PATH"
			:load_plugins="false"
			:force_project_algorithm="findRP"
			toolbar_component="explorer-rp-toolbar"
		/>
		<content-plugins v-else-if="component === 'Extensions'" />
		<content-debug-log v-else-if="component === 'DebugLog'" />
		<content-documentation v-else-if="component === 'Documentation'" />

		<content-file-search v-else-if="component === 'file_search'" />
		<content-vanilla-assets v-else-if="component === 'VanillaPacks'" />

		<component v-else-if="typeof component === 'function'" :is="component" />
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

import { BASE_PATH, RP_BASE_PATH } from '../../../constants'
import findRP from '../../../Utilities/FindRP'

export default {
	name: 'SidebarContent',
	props: {
		component: String | Function,
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
