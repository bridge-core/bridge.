<template>
	<div v-resize="onResize" class="canvas-container">
		<canvas
			:height="available_height"
			:width="available_width"
			ref="canvas"
		/>

		<v-container v-if="textures.length > 1" class="canvas-overlay">
			<v-card>
				<v-card-text>
					<v-chip-group
						v-model="selectedTexture"
						active-class="primary--text"
						mandatory
					>
						<v-chip
							v-for="({ name, texture }, i) in textures"
							:key="i"
						>
							{{ name }}
						</v-chip>
					</v-chip-group>
				</v-card-text>
			</v-card>
		</v-container>
	</div>
</template>

<script>
import { createModelEditor } from '../../../scripts/editor/Model/create'
import EventBus from '../../../scripts/EventBus'

let editor
export default {
	name: 'ModelEditor',
	props: {
		available_height: Number,
		file_path: String,
	},
	data: () => ({
		available_width: 0,
		textures: [],
		selectedTexture: 0,
	}),
	async mounted() {
		editor = await createModelEditor(this.$refs.canvas, {
			file_path: this.file_path,
		})
		this.textures = editor.textures
		this.onResize()
		editor.startRendering()
		this.$store.commit('removeLoadingWindow', { id: 'open-file' })

		EventBus.on('updateTabUI', this.onResize)
	},

	activated() {
		if (editor) editor.startRendering()
	},
	deactivated() {
		if (editor) editor.stopRendering()
	},

	destroyed() {
		if (editor) editor.stopRendering()
		EventBus.off('updateTabUI', this.onResize)
	},

	methods: {
		onResize() {
			requestIdleCallback(() => {
				this.available_width = EventBus.trigger(
					'bridge:getFileContainerWidth'
				)[0]

				if (editor !== undefined)
					editor.resize(this.available_width, this.available_height)
			})
		},
	},
	watch: {
		selectedTexture(to) {
			editor.setTexture(this.textures[to].texture)
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
	max-width: unset;
	position: absolute;
}
</style>
