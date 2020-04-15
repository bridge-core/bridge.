<template>
	<v-dialog v-model="PlayState.isVisible" fullscreen>
		<v-card color="background">
			<PlayToolbar />

			<canvas v-if="isCanvasPlayer" :ref="canvas" />
			<span v-else-if="PlayState.player === 'entity'">
				Entity Simulator... Yay!
			</span>
		</v-card>
	</v-dialog>
</template>

<script>
import { PlayState, CanvasPlayers } from '../../scripts/Play/state'
import PlayToolbar from './Toolbar'

export default {
	name: 'PlayScreen',
	components: {
		PlayToolbar,
	},
	data: () => ({
		PlayState,
	}),

	computed: {
		isCanvasPlayer() {
			return CanvasPlayers.includes(PlayState.player)
		},
	},
}
</script>

<style></style>
