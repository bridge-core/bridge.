<template>
	<span>
		<v-btn color="primary" :disabled="!hasPlaySession(filePath)" @click="startPlaySession(filePath)">
			<v-icon small>mdi-nintendo-game-boy</v-icon>Play!
		</v-btn>
		<PlayScreen v-if="PlayState.isVisible" :filePath="filePath" />
	</span>
</template>

<script>
import { PlayState } from '../../scripts/Play/state'
import { hasPlaySession, startPlaySession } from '../../scripts/Play/start'
import PlayScreen from './Main'

export default {
	name: 'PlayButton',
	props: {
		filePath: String,
	},
	components: {
		PlayScreen,
	},

	data: () => ({
		PlayState,
		startPlaySession,
		hasPlaySession,
	}),
}
</script>

<style></style>
