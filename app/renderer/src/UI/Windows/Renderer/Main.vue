<template>
	<div>
		<window
			v-for="(win, i) in windows"
			:key="`plugin-popup-window-${i}-${win.id}`"
			:win="win"
		/>
	</div>
</template>

<script>
import Window from './Window'

export default {
	name: 'window-factory-main',
	components: {
		Window,
	},
	computed: {
		windows() {
			return this.$store.state.WindowFactory.elements
		},
	},
}
</script>
