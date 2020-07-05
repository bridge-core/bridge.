<template>
	<Highlight
		v-if="!isEditing"
		ref="highlight"
		:tagName="tagName"
		:language="language"
		:value="value"
		:isOnScreen="isOnScreen"
		@click.native="onClick"
		@load="trySetWidth"
		@error="trySetWidth"
	/>
	<component v-else :is="tagName">
		<input
			ref="input"
			class="inline-edit"
			:style="{ width: width && tagName !== 'summary' ? `${width}px` : undefined }"
			:value="value"
			@input="onInput"
			@blur="deactivateEditMode"
			@keydown.enter="deactivateEditMode"
		/>
	</component>
</template>

<script>
import Highlight from '../Editor/JSON/Highlight.vue'
import TabSystem from '../../TabSystem'

export default {
	name: 'TreeKey',
	props: {
		value: String,
		isOnScreen: Boolean,
		language: String,
		tagName: {
			type: String,
			default: 'summary',
		},
	},
	components: {
		Highlight,
	},
	data() {
		return {
			isEditing: false,
			openTimeout: null,
			width: null,
		}
	},
	mounted() {
		this.trySetWidth()
	},

	methods: {
		onClick(event) {
			event.preventDefault()
			event.stopPropagation()

			if (event.detail === 1) {
				//Single click
				this.openTimeout = setTimeout(() => {
					this.openTimeout = null
					this.$emit('click')
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
		onInput() {
			this.$emit('input', this.$refs.input.value || '')
			this.trySetWidth()
		},
		activateEditMode() {
			this.isEditing = true
			this.$nextTick(() => this.$refs.input.focus())
		},
		deactivateEditMode() {
			this.isEditing = false
			this.$nextTick(() => this.trySetWidth())
		},
		trySetWidth() {
			try {
				this.width = this.$refs.highlight.$el.getBoundingClientRect().width
			} catch (error) {
				this.width = this.$refs.input.getBoundingClientRect().width
			}
		},
	},
}
</script>

<style>
.inline-edit {
	display: inline;
	outline: none;
}

.theme--dark .inline-edit {
	color: white;
}

.theme--light .inline-edit {
	color: black;
}
</style>