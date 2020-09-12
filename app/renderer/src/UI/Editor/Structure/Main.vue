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
import { loadStructure } from './load'

let editor
export default {
	name: 'StructureEditor',
	props: {
		availableHeight: Number,
		filePath: String,
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
