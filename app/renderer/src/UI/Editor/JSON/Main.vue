<template>
	<div :style="`height: ${availableHeight}px; overflow-y: auto;`">
		<UtilBar />
		<TreeRenderer :tree="jsonTree" :language="language" />
	</div>
</template>

<script>
import UtilBar from '../UtilBar/Main'
import TreeRenderer from './Tree'
import JSONTree from '../../../editor/JsonTree'
import InternalJSON from '../../../editor/Json'

export default {
	name: 'JSONEditor',
	components: {
		UtilBar,
		TreeRenderer,
	},
	props: {
		json: Object,
		availableHeight: Number,
		language: {
			type: String,
			default: 'json',
		},
	},

	computed: {
		jsonTree() {
			if (this.json instanceof JSONTree) return this.json

			let tree = InternalJSON.Format.toTree(
				this.object,
				this.current_file_path,
				!this.is_immutable
			)

			TabSystem.setTabCompiled(true)
			TabSystem.setCurrentContent(tree)

			return tree
		},
	},
}
</script>
