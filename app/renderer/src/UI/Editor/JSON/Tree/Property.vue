<template>
	<span>
		<v-icon style="opacity: 0.6;" small>mdi-chevron-right</v-icon>
		<Highlight
			v-if="!isInArray"
			:class="{
				'error-line': hasError && !tree.error.isDataError,
				'warning-line': hasWarning && !tree.error.isDataError,
			}"
			@click="onClick"
			:value="tree.key"
			:isOnScreen="isOnScreen"
			:language="language"
		/>{{ !isInArray && tree.data !== '' ? ':' : '' }}
		<Highlight
			:class="{
				'error-line': hasError && tree.error.isDataError,
				'warning-line': hasWarning && tree.error.isDataError,
			}"
			:value="getArrayTransformedData(tree.data)"
			:isOnScreen="isOnScreen"
			:language="dataLanguage"
		/>

		<br />
	</span>
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
		Highlight,
	},

	methods: {
		getArrayTransformedData(data) {
			if (data === '') return '{}'
			return this.getData(data) + (this.isInArray ? ',' : '')
		},
		getData(data) {
			if (data === '' || this.tree.meta.language) return data
			if (!Number.isNaN(Number(data))) return data
			if (data === 'true' || data === 'false') return data
			return `"${data}"`
		},
		onClick() {
			this.tree.toggleOpen()
		},
	},

	computed: {
		isInArray() {
			return this.tree.parent && this.tree.parent.is_array
		},
		dataLanguage() {
			return this.tree.meta.language || this.language
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
}
</script>

<style>
.error-line {
	border-bottom: 2px dotted #f44336;
}
.warning-line {
	border-bottom: 2px dotted #ffa000;
}
</style>
