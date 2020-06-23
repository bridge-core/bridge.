<template>
	<Highlight
		v-if="!isEditing"
		tagName="summary"
		:language="language"
		:value="treeKey"
		:isOnScreen="isOnScreen"
		@click.native="onClick"
	/>
	<summary v-else>
		<input
			ref="input"
			class="inline-edit"
			v-model="treeKey"
			@blur="deactivateEditMode"
			@keydown.enter="deactivateEditMode"
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
		isData: String,
	},
	components: {
		Highlight,
	},
	data: () => ({
		isEditing: false,
		openTimeout: null,
	}),

	computed: {
		treeKey: {
			set(val) {
				TabSystem.setCurrentUnsaved()

				if (this.isData) this.tree.edit(val, true)
				else this.tree.editKey(val, true, false)
			},
			get() {
				if (this.isData) return this.tree.data
				return this.tree.key
			},
		},
	},

	methods: {
		onClick(event) {
			event.preventDefault()
			event.stopPropagation()
			console.log(event.detail)

			if (event.detail === 1) {
				// this.tree.updateUUID()
				//Single click
				this.openTimeout = setTimeout(() => {
					this.openTimeout = null
					this.tree.toggleOpen()
				}, 220)
			} else if (event.detail === 2) {
				//Double click
				if (this.openTimeout) {
					clearTimeout(this.openTimeout)
					this.openTimeout = null
				}
				this.activateEditMode()
			}
		},
		activateEditMode() {
			this.isEditing = true
			this.$nextTick(() => this.$refs.input.focus())
		},
		deactivateEditMode() {
			this.isEditing = false
		},
	},
}
</script>

<style>
.theme--dark .inline-edit {
	color: white;
}

.theme--light .inline-edit {
	color: black;
}
</style>