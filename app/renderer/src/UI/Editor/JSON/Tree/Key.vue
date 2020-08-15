<template>
	<summary @click="onClick">
		<v-icon small>
			{{ tree.open ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
		</v-icon>
		<Highlight
			:class="{
				'error-line': hasError && !tree.error.isDataError,
				'warning-line': hasWarning && !tree.error.isDataError,
			}"
			:value="treeKey"
			:isOnScreen="isOnScreen"
			:language="language"
		/>
	</summary>
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

			return `${!this.isInArray ? this.tree.key + ' ' : ''}${
				brackets[0]
			}${
				this.tree.open
					? ''
					: `...${brackets[1]}${this.isInArray ? ',' : ''}`
			}`
		},
		hasError() {
			return (
				this.tree.error &&
				this.tree.error.show &&
				!this.tree.error.isWarning
			)
		},
		hasWarning() {
			return (
				this.tree.error &&
				this.tree.error.show &&
				this.tree.error.isWarning
			)
		},
	},
	methods: {
		onClick(event) {
			event.preventDefault()
			this.tree.toggleOpen()
		},
	},
}
</script>

<style scoped>
summary::-webkit-details-marker {
	display: none;
}
</style>
