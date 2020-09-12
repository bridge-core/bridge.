<template>
	<div v-resize="onResize" class="canvas-container">
		<canvas
			:height="availableHeight"
			:width="availableWidth"
			ref="canvas"
		/>

		<!-- <div class="canvas-overlay">
			<v-avatar size="36px">
				<img
					alt="Avatar"
					src="https://avatars0.githubusercontent.com/u/9064066?v=4&s=460"
				/>
			</v-avatar>
		</div>-->
	</div>
</template>

<script>
import { createVoxelEditor } from './create'

let editor
export default {
	name: 'VoxelEditor',
	props: {
		availableHeight: Number,
		availableWidth: Number,
	},
	mounted() {
		editor = createVoxelEditor(this.$refs.canvas)
		this.onResize()
		editor.startRendering()
	},

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
			if (editor !== undefined)
				editor.resize(window.innerWidth - 60, window.innerHeight - 56)
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
