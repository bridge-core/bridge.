<template>
	<div
		v-resize="onResize"
		ref="container"
		style="width: 100%;"
		class="canvas-container"
	>
		<canvas
			:height="availableHeight"
			:width="availableWidth"
			ref="canvas"
		/>

		<Hotbar class="canvas-overlay" />
	</div>
</template>

<script>
import { loadStructure } from './load'
import Hotbar from '../Voxel/Inventory/Hotbar.vue'

let editor
export default {
	name: 'StructureEditor',
	props: {
		availableHeight: Number,
		filePath: String,
	},
	components: {
		Hotbar,
	},
	async mounted() {
		editor = await loadStructure(this.filePath, this.$refs.canvas)
		this.onResize()
		editor.startRendering()
	},
	data: () => ({ availableWidth: 0 }),

	activated() {
		editor.startRendering()
	},
	deactivated() {
		editor.stopRendering()
	},

	destroyed() {
		editor.stopRendering()
	},

	methods: {
		onResize() {
			this.availableWidth = this.$refs.container.getBoundingClientRect().width
			if (editor !== undefined)
				editor.resize(this.availableWidth, this.availableHeight)
		},
	},
}
</script>

<style scoped>
canvas:focus {
	outline: none;
}

.canvas-container {
	position: relative;
	height: 100%;
	width: 100%;
}
.canvas-container canvas,
.canvas-overlay {
	position: absolute;
}
</style>
