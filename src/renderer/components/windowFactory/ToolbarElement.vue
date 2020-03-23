<template>
	<v-tooltip bottom color="tooltip" :disabled="!show_tooltip">
		<template v-slot:activator="{ on }">
			<v-btn
				v-on="on"
				@click.stop="click"
				class="toolbar-button"
				small
				icon
			>
				<v-icon :color="element.color" small>{{ display_icon }}</v-icon>
			</v-btn>
		</template>

		<span>{{ display_name }}</span>
	</v-tooltip>
</template>

<script>
export default {
	name: 'toolbar-element',
	props: {
		element: Object,
	},
	computed: {
		click() {
			if (typeof this.element.action != 'function') return () => {}
			return this.element.action
		},
		display_icon() {
			if (!this.element.display_icon) return 'fullscreen'
			return this.element.display_icon
		},
		display_name() {
			if (!this.element.display_name) return ''
			return this.element.display_name
		},
		show_tooltip() {
			return (
				this.element.display_name != undefined &&
				this.element.display_text != ''
			)
		},
	},
}
</script>

<style scoped>
.toolbar-button {
	height: 28px;
	width: 28px;
}
</style>
