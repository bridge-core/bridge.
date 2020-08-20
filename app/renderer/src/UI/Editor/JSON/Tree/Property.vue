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
				<summary
					v-on="on"
					style="display: inline;"
					:class="{
						'error-line': hasError && !tree.error.isDataError,
						'warning-line': hasWarning && !tree.error.isDataError,
						selected: isSelected(),
					}"
				>
					<Highlight
						@click="onClick"
						:value="tree.key"
						:isOnScreen="isOnScreen"
						:language="language"
					/>
				</summary>
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
				<summary
					v-on="on"
					style="display: inline;"
					:class="{
						'error-line': hasError && tree.error.isDataError,
						'warning-line': hasWarning && tree.error.isDataError,
						selected: isDataSelected(),
					}"
				>
					<Highlight
						@click="onDataClick"
						:value="getData(tree.data)"
						:isOnScreen="isOnScreen"
						:language="dataLanguage"
					/>
				</summary>
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
import Interact from './shared.ts'

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
	mixins: [Interact],

	computed: {
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
.theme--light .selected {
	font-style: italic;
	background: rgba(65, 65, 65, 0.2);
}

.theme--dark .selected {
	font-style: italic;
	background: rgba(135, 135, 135, 0.2);
}
</style>

<style scoped>
summary {
	outline: none;
	cursor: pointer;
	transition: all ease-in-out 0.1s;
}
</style>
