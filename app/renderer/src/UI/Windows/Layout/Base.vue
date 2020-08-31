<template>
	<v-dialog
		:value="isVisible"
		@input="$emit('closeWindow')"
		:persistent="isPersistent"
		:hide-overlay="!blurBackground"
		:max-width="isFullscreen ? maxWindowWidth : windowWidth"
		content-class="no-overflow"
	>
		<v-card height="100%" width="100%" color="background">
			<v-system-bar v-if="!hideToolbar" height="30px" color="toolbar">
				<span>{{ windowTitle }}</span>
				<v-spacer></v-spacer>
				<v-toolbar-items class="px14-font">
					<slot name="toolbar" />

					<v-btn
						small
						icon
						@click.stop="$emit('toggleFullscreen')"
						v-if="hasMaximizeButton"
					>
						<v-icon small>mdi-plus</v-icon>
					</v-btn>
					<v-divider v-if="hasCloseButton" vertical />
					<v-btn
						small
						icon
						color="error"
						@click.stop="$emit('closeWindow')"
						v-if="hasCloseButton"
					>
						<v-icon
							:color="isDarkMode ? 'white' : 'grey darken-1'"
							small
						>
							mdi-close
						</v-icon>
					</v-btn>
				</v-toolbar-items>
			</v-system-bar>

			<v-card-text
				:style="
					`padding-top: 12px; max-height: ${maxWindowHeight}px; height: ${
						isFullscreen ? maxWindowHeight : windowHeight
					}px; overflow-y: auto;`
				"
			>
				<slot name="default" />
			</v-card-text>

			<v-card-actions background-color="footer">
				<slot name="actions" />
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	name: 'BaseWindow',
	props: {
		isFullscreen: Boolean,
		isVisible: Boolean,
		isPersistent: Boolean,
		blurBackground: {
			type: Boolean,
			default: true,
		},
		hideToolbar: Boolean,
		windowTitle: String,
		hasCloseButton: {
			type: Boolean,
			default: true,
		},
		hasMaximizeButton: {
			type: Boolean,
			default: true,
		},
		width: {
			type: Number,
			default: 1600,
		},
		maxWidth: {
			type: Number,
			default: 1600,
		},
		height: {
			type: Number,
			default: 800,
		},
		maxHeight: {
			type: Number,
			default: 800,
		},
		percentageHeight: Number,
		percentageWidth: Number,
		maxPercentageHeight: Number,
		maxPercentageWidth: Number,
	},
	computed: {
		isDarkMode() {
			return this.$store.state.Appearance.is_dark_mode
		},
		windowWidth() {
			if (this.percentageWidth == undefined) {
				return this.width
			} else {
				return (window.innerWidth / 100) * this.percentageWidth
			}
		},
		windowHeight() {
			if (this.percentageHeight == undefined) {
				return this.height
			} else {
				return (window.innerHeight / 100) * this.percentageHeight - 150
			}
		},
		maxWindowHeight() {
			if (this.maxPercentageHeight == undefined) {
				return this.maxHeight
			} else {
				return (
					(window.innerHeight / 100) * this.maxPercentageHeight - 150
				)
			}
		},
		maxWindowWidth() {
			if (this.maxPercentageWidth == undefined) {
				return this.maxWidth
			} else {
				return (window.innerWidth / 100) * this.maxPercentageWidth
			}
		},
	},
}
</script>

<style>
.no-overflow {
	overflow: hidden;
}
</style>
