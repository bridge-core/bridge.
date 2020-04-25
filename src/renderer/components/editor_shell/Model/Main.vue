<template>
	<div v-resize="onResize" class="canvas-container">
		<canvas ref="canvas" />

		<v-container class="canvas-overlay">
			<!-- Disabled until we ship "bridge. Play!" -->
			<!-- <PlayButton :filePath="file_path" style="margin-right: 8px" /> -->
			<v-icon v-if="should_show_menu" @click="is_visible = !is_visible">
				{{
				is_visible ? 'mdi-close' : 'mdi-cog'
				}}
			</v-icon>
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
import PlayButton from '../../Play/PlayButton'
import { createModelEditor } from '../../../scripts/editor/Model/create'
import EventBus from '../../../scripts/EventBus'
import { basename } from 'path'
let editor

export default {
	name: 'ModelEditor',
	components: {
		PlayButton,
	},
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
		this.$refs.canvas.height = this.available_height
		this.$refs.canvas.width = EventBus.trigger(
			'bridge:getFileContainerWidth'
		)[0]

		this.$nextTick(async () => {
			editor = await createModelEditor(this.$refs.canvas, {
				file_path: this.file_path,
				show_helpers: true,
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
				text: `${basename(entry.texture.file_path)} (${
					entry.texture.name
				})`,
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
	height: 100%;
	width: 100%;
}
.canvas-container canvas,
.canvas-overlay {
	position: absolute;
}
.canvas-overlay {
	max-width: 30%;
}
</style>
