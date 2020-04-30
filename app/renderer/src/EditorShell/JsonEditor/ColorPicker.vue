<template>
	<span>
		<div
			@click="openWindow"
			:style="`background: ${color}; border: 2px solid ${outline_color};`"
			class="color-picker"
		/>
	</span>
</template>

<script>
import TabSystem from '../../../src/TabSystem'
import { JSONAction } from '../../../src/TabSystem/CommonHistory'
import ColorPicker from '../../../windows/ColorPicker'

export default {
	props: {
		node_context: Object,
		is_immutable: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			is_visible: false,
		}
	},
	computed: {
		outline_color() {
			return this.$store.state.Appearance.is_dark_mode ? 'white' : 'black'
		},
		color() {
			return this.node_context.data
		},
	},
	methods: {
		openWindow() {
			if (this.is_immutable) return
			new ColorPicker(this.node_context.data, val => {
				if (val === this.node_context.data) return
				TabSystem.getHistory().add(
					new JSONAction(
						'edit-data',
						this.node_context,
						this.node_context.data
					)
				)
				TabSystem.setCurrentUnsaved()
				this.node_context.edit(val)
			})
		},
	},
}
</script>

<style></style>
<style scoped>
.color-picker {
	display: inline-block;
	margin-left: 4px;
	height: 8px;
	width: 8px;
}
</style>
