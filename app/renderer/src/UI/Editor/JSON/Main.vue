<template>
	<div :style="`height: ${availableHeight}px; overflow-y: auto;`">
		<UtilBar />
		<TreeRenderer
			:style="
				`height: ${availableHeight -
					170 * !this.isImmutable}px; margin-top: 12px;`
			"
			:tree="jsonTree"
			:language="language"
		/>
		<v-divider />

		<v-layout style="margin-right: 0.75em;" v-if="!isImmutable">
			<template
				v-if="
					$store.state.Settings.bridge_predictions &&
						isKnownFileType()
				"
			>
				<predicting-input
					:render_object="jsonTree"
					:tab_id="tabId"
					:file_navigation="fileNavigation"
					:current_file_path="filePath"
					:is_active="isActive"
				/>
				<json-input
					ref="edit"
					:render_object="jsonTree"
					:tab_id="tabId"
					type="edit"
					:file_navigation="fileNavigation"
					:current_file_path="filePath"
					:is_active="isActive"
				/>
			</template>
			<template v-else>
				<json-input
					v-for="input_type in ['object', 'value', 'edit']"
					:ref="input_type"
					:render_object="jsonTree"
					:tab_id="tabId"
					:type="input_type"
					:key="`${input_type}`"
					:file_navigation="fileNavigation"
					:current_file_path="filePath"
					:is_active="isActive"
				/>
			</template>
		</v-layout>
	</div>
</template>

<script>
import UtilBar from '../UtilBar/Main'
import TreeRenderer from './Tree'
import JSONTree from '../../../editor/JsonTree'
import InternalJSON from '../../../editor/Json'
import TabSystem from '../../../TabSystem'
import FileType from '../../../editor/FileType'
import JsonInput from '../JsonEditor/JsonInput'
import PredictingInput from '../JsonEditor/PredictingInput'

export default {
	name: 'JSONEditor',
	components: {
		UtilBar,
		TreeRenderer,
		JsonInput,
		PredictingInput,
	},
	props: {
		json: Object,
		availableHeight: Number,
		filePath: String,
		language: {
			type: String,
			default: 'json',
		},
		isImmutable: Boolean,
		isActive: Boolean,
		tabId: Number,
	},

	computed: {
		jsonTree() {
			if (this.json instanceof JSONTree) return this.json

			let tree = new JSONTree('global').buildFromObject(this.json)
			if (!this.isImmutable) tree.loadMeta(this.filePath, true)

			TabSystem.setTabCompiled(true)
			TabSystem.setCurrentContent(tree)

			return tree
		},
		fileNavigation() {
			return TabSystem.getCurrentNavigation()
		},
	},
	methods: {
		isKnownFileType() {
			return FileType.get() !== 'unknown'
		},
	},
}
</script>
