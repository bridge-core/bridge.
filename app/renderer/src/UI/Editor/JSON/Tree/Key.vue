<template>
	<summary @click="onClick">
		<v-icon small>
			{{ tree.open ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
		</v-icon>

		<!--- Default display for treeKey --->
		<v-tooltip
			v-if="treeKey !== ''"
			:color="tree.error && tree.error.isWarning ? 'warning' : 'error'"
			:disabled="!tree.error"
			right
		>
			<template v-slot:activator="{ on, attrs }">
				<span v-on="on">
					<Highlight
						v-bind="attrs"
						:class="{
							'error-line': hasError && !tree.error.isDataError,
							'warning-line':
								hasWarning && !tree.error.isDataError,
						}"
						:value="treeKey"
						:isOnScreen="isOnScreen"
						:language="language"
					/>
				</span>
			</template>
			<span v-if="tree.error">{{ tree.error.message }}</span>
		</v-tooltip>

		<!--- Display errors if tree is part of array & if child has error/warning --->
		<v-tooltip
			:color="tree.error && tree.error.isWarning ? 'warning' : 'error'"
			:disabled="!tree.error"
			right
		>
			<template v-slot:activator="{ on, attrs }">
				<span
					v-on="on"
					:class="{
						'warning-line':
							(!tree.open && childHasWarning) ||
							(treeKey === '' && hasWarning),
						'error-line':
							(!tree.open && childHasError) ||
							(treeKey === '' && hasError),
					}"
				>
					{{ brackets[0] + (tree.open ? '' : `...${brackets[1]}`) }}
				</span>
			</template>
			<span v-if="tree.error">{{ tree.error.message }}</span>
		</v-tooltip>
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
		brackets() {
			if (this.tree.is_array) return '[]'
			return '{}'
		},
		treeKey() {
			return !this.isInArray ? this.tree.key : ''
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
		childHasError() {
			return this.tree.child_contains_error
		},
		childHasWarning() {
			return this.tree.child_contains_warning
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
