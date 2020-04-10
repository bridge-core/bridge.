<template>
	<div
		v-resize="onResize" 
		class="canvas-container"
		:style="`height: ${this.available_height}px; width: ${this.available_width}px;`"
	>
		<canvas
			:height="available_height"
			:width="available_width"
			ref="canvas"
		/>

		<v-container v-if="should_show_menu" class="canvas-overlay">
			<v-icon @click="is_visible = !is_visible">{{
				is_visible ? 'mdi-close' : 'mdi-settings'
			}}</v-icon>
			<v-card
				:style="
					`
					margin-top: 8px;
					background-color: var(--v-menu-base); 
					max-height: ${available_height - 160}px;
					overflow-y: auto;
				`
				"
				v-if="is_visible"
			>
				<v-card-title>Model Options</v-card-title>
				<div v-for="(arr, id) in textures" :key="id">
					<v-card-text v-if="arr.length > 1">
						Texture: {{ id }}
						<v-select
							v-model="selected[id]"
							background-color="menu lighten-1"
							solo
							:items="convertArr(arr)"
							@change="selectTexture"
						/>
					</v-card-text>
				</div>
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
		is_visible: false,
		selected: {},
	}),
	mounted() {
		this.$nextTick(async () => {
			editor = await createModelEditor(this.$refs.canvas, {
				file_path: this.file_path,
			})
			this.textures = editor.textures
			Object.entries(this.textures).forEach(
				([id, data]) => (this.selected[id] = data[0])
			)
			this.onResize()

			editor.startRendering()
			this.$store.commit('removeLoadingWindow', { id: 'open-file' })

			EventBus.on('updateTabUI', this.onResize)
			EventBus.on('bridge:themeChanged', this.updateBackground)
		})
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
		EventBus.off('bridge:themeChanged', this.updateBackground)
	},

	computed: {
		should_show_menu() {
			return (
				Object.values(this.textures).filter(arr => arr.length > 1)
					.length > 0
			)
		},
		is_dark_mode() {
			return this.$store.state.Appearance.is_dark_mode
		},
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
		selectTexture(tex) {
			editor.setTexture(tex)
		},
		updateBackground() {
			setTimeout(() =>
				editor.setBackground(
					Number(
						getComputedStyle(document.body)
							.getPropertyValue('--v-background-base')
							.replace('#', '0x')
					)
				)
			)
		},
		convertArr(arr) {
			return arr.map(entry => ({
				text: entry.texture.name,
				value: entry,
			}))
		},
	},
	watch: {
		is_dark_mode() {
			this.updateBackground()
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
}
.canvas-container canvas,
.canvas-overlay {
	position: absolute;
}
.canvas-overlay {
	max-width: 30%;
}
</style>
