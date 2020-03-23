<template>
	<v-tooltip color="tooltip" :disabled="selected" right>
		<template v-slot:activator="{ on }">
			<v-list-item
				:style="
					`border-left: 2px solid ${
						selected ? 'var(--v-primary-base)' : 'rgab(0, 0, 0, 0)'
					};`
				"
				v-on="on"
				@click.stop="action"
			>
				<v-list-item-action class="sidebar-action">
					<v-layout align-center>
						<v-icon
							medium
							:style="`opacity: ${opacity};`"
							:color="item.color"
							>{{ item.icon }}</v-icon
						>
					</v-layout>
				</v-list-item-action>
			</v-list-item>
		</template>

		<span>{{ item.title }}</span>
	</v-tooltip>
</template>

<script>
export default {
	name: 'sidebar-element',
	props: {
		item: Object,
		opacity: {
			type: Number,
			default: 1,
		},
		action: Function,
		selected: Boolean,
	},
}
</script>

<style scoped>
span {
	cursor: pointer;
}
</style>
<style>
.sidebar-action {
	margin: 0 !important;
}
</style>
