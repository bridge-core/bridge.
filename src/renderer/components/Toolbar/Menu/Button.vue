<template>
	<v-btn small text class="toolbar-btn" @click="$emit('click', $event)">
		<v-icon
			v-if="displayIcon"
			color="primary"
			style="margin-right: 6px; font-style: normal;"
		>
			{{ displayIcon }}
		</v-icon>

		<span> {{ displayName }} </span>
	</v-btn>
</template>

<script>
export default {
	name: 'MenuButton',
	props: {
		displayName: String,
		displayIcon: String,
	},
}
</script>

<style scoped>
.toolbar-btn {
	-webkit-app-region: no-drag;
	min-width: 0;
}
</style>
