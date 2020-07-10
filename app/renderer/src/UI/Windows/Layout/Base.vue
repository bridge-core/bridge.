<template>
	<v-dialog
		:value="isVisible"
		@input="$emit('closeWindow')"
		:persistent="isPersistent"
		:hide-overlay="!blurBackground"
		:max-width="isFullscreen ? maxWidth : width"
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
					`padding-top: 12px; max-height: ${maxHeight}px; height: ${
						isFullscreen ? maxHeight : height
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
	},
	computed: {
		isDarkMode() {
			return this.$store.state.Appearance.is_dark_mode
		},
	},
}
</script>

<style>
.no-overflow {
	overflow: hidden;
}
</style>
