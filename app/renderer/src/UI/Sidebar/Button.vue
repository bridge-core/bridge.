<template>
	<v-tooltip color="tooltip" :disabled="isSelected" right>
		<template v-slot:activator="{ on }">
			<v-list-item
				v-on="on"
				:style="
					`border-left: 3px solid ${
						isSelected
							? 'var(--v-primary-base)'
							: 'rgab(0, 0, 0, 0)'
					};`
				"
				@click.stop="$emit('click')"
			>
				<v-list-item-action style="margin: 0;">
					<v-icon
						medium
						:style="`opacity: ${opacity};`"
						:color="color"
					>
						{{ icon }}
					</v-icon>
				</v-list-item-action>
			</v-list-item>
		</template>

		<span>{{ displayName }}</span>
	</v-tooltip>
</template>

<script>
export default {
	name: 'SidebarButton',
	props: {
		displayName: String,
		icon: String,
		color: String,
		isSelected: Boolean,
		opacity: {
			type: Number,
			default: 1,
		},
	},
}
</script>

<style scoped>
span {
	cursor: pointer;
}
</style>
