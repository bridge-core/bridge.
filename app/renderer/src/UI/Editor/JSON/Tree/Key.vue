<template>
	<EditableHighlight
		v-model="treeKey"
		@click="tree.toggleOpen()"
		:isOnScreen="isOnScreen"
		:language="language"
	/>
</template>

<script>
import Highlight from '../Highlight.vue'
import JSONTree from '../../../../editor/JsonTree'
import TabSystem from '../../../../TabSystem'
import EditableHighlight from '../../../Common/EditableHighlight'

export default {
	name: 'TreeKey',
	props: {
		isOnScreen: Boolean,
		tree: JSONTree,
		language: String,
	},
	components: {
		EditableHighlight,
	},

	computed: {
		treeKey: {
			set(val) {
				TabSystem.setCurrentUnsaved()

				this.tree.editKey(val, true, false)
			},
			get() {
				return this.tree.key
			},
		},
	},
}
</script>
