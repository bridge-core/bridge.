<template>
	<v-btn small icon @click.stop="action" :color="color" class="toolbar-btn">
		<v-icon small>{{ icon }}</v-icon>
	</v-btn>
</template>

<script>
export default {
	name: 'WindowAction',
	components: {},
	props: {
		action: Function,
		icon: String,
		color: String,
	},
}
</script>

<style scoped>
.toolbar-btn {
	-webkit-app-region: no-drag;
	min-width: 0;
}

.toolbar-btn .v-icon {
	margin-right: 0;
}
</style>
