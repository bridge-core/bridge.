<template>
	<span>
		<v-icon style="opacity: 0.5;" small>mdi-chevron-right</v-icon>
		<v-tooltip
			v-if="!isInArray"
			:color="tree.error && tree.error.isWarning ? 'warning' : 'error'"
			:disabled="!tree.error || tree.error.isDataError"
			right
		>
			<template v-slot:activator="{ on, attrs }">
				<span v-on="on">
					<Highlight
						:class="{
							'error-line': hasError && !tree.error.isDataError,
							'warning-line':
								hasWarning && !tree.error.isDataError,
						}"
						@click="onClick"
						:value="tree.key"
						:isOnScreen="isOnScreen"
						:language="language"
					/>
				</span>
			</template>
			<span v-if="tree.error">{{ tree.error.message }}</span>
		</v-tooltip>
		<span>{{ !isInArray && tree.data !== '' ? ':' : '' }}</span>

		<v-tooltip
			:color="tree.error && tree.error.isWarning ? 'warning' : 'error'"
			:disabled="!tree.error || !tree.error.isDataError"
			right
		>
			<template v-slot:activator="{ on, attrs }">
				<span v-on="on">
					<Highlight
						:class="{
							'error-line': hasError && tree.error.isDataError,
							'warning-line':
								hasWarning && tree.error.isDataError,
						}"
						:value="getData(tree.data)"
						:isOnScreen="isOnScreen"
						:language="dataLanguage"
					/>
				</span>
			</template>
			<span v-if="tree.error">{{ tree.error.message }}</span>
		</v-tooltip>

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
		getData(data) {
			if (data === '') return '{}'
			if (this.tree.meta.language) return data
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
