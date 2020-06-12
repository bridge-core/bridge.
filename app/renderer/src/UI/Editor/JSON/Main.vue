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
import TabSystem from '../../../TabSystem'

export default {
	name: 'JSONEditor',
	components: {
		UtilBar,
		TreeRenderer,
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
	},

	computed: {
		jsonTree() {
			if (this.json instanceof JSONTree) return this.json

			let tree = new JSONTree('global').buildFromObject(this.json)
			if (!this.isImmutable) tree.loadMeta(this.filePath, true)
			console.log(tree, this.json)

			TabSystem.setTabCompiled(true)
			TabSystem.setCurrentContent(tree)

			return tree
		},
	},
}
</script>
