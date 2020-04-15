<template>
	<span v-if="isShowing">
		<v-container class="utility-bar">
			<PlayButton :filePath="filePath" />

			<v-text-field
				class="right-util"
				style="max-width: 200px;"
				hide-details
				solo
				prepend-inner-icon="mdi-magnify"
			/>
		</v-container>
		<v-divider style="padding-top: 8px;" />
	</span>
</template>

<script>
import PlayButton from '../../Play/PlayButton'

export default {
	name: 'UtilBar',
	components: {
		PlayButton,
	},
	props: {
		filePath: String,
	},
	computed: {
		isShowing() {
			return !this.$store.state.Settings.hide_file_toolbar
		},
	},
}
</script>

<style scoped>
.utility-bar {
	margin: 0;
	max-width: unset;
	display: flex;
	align-items: center;
}
.utility-bar > * {
	display: inline-flex;
	margin-right: 8px;
}
.right-util {
	margin-left: auto;
	margin-right: unset;
}
</style>
