<template>
	<span>
		<v-btn
			color="primary"
			:disabled="!hasPlaySession(filePath)"
			@click="startPlaySession(filePath)"
		>
			<v-icon small>mdi-nintendo-game-boy</v-icon>
			Play!
		</v-btn>
		<PlayScreen />
	</span>
</template>

<script>
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
		startPlaySession,
		hasPlaySession,
	}),
}
</script>

<style></style>
