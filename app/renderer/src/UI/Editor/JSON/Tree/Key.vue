<template>
	<Highlight
		tagName="summary"
		@click="tree.toggleOpen()"
		:value="treeKey"
		:isOnScreen="isOnScreen"
		:language="language"
	/>
</template>

<script>
import Highlight from '../Highlight.vue'
import JSONTree from '../../../../editor/JsonTree'
import TabSystem from '../../../../TabSystem'

export default {
	name: 'TreeKey',
	props: {
		isOnScreen: Boolean,
		tree: JSONTree,
		language: String,
	},
	components: {
		Highlight,
	},

	computed: {
		isInArray() {
			return this.tree.parent && this.tree.parent.is_array
		},
		treeKey() {
			let brackets = '{}'
			if (this.tree.is_array) brackets = '[]'

			return `${!this.isInArray ? this.tree.key : ''} ${brackets[0]}${
				this.tree.open
					? ''
					: `...${brackets[1]}${this.isInArray ? ',' : ''}`
			}`
		},
	},
}
</script>
