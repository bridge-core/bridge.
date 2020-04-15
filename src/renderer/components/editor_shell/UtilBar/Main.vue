<template>
	<v-container class="utility-bar">
		<v-btn color="primary" @click="PlayState.isVisible = true">
			<v-icon small>mdi-nintendo-game-boy</v-icon>
			Play!
		</v-btn>
		<PlayScreen />

		<v-text-field
			class="right-util"
			style="max-width: 200px;"
			hide-details
			solo
			prepend-inner-icon="mdi-magnify"
		/>
	</v-container>
</template>

<script>
import { PlayState } from '../../../scripts/Play/state'
import PlayScreen from '../../Play/Main'

export default {
	name: 'UtilBar',
	components: {
		PlayScreen,
	},
	data: () => ({
		PlayState,
	}),
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
