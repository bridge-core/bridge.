<template>
	<div>
		<v-overlay
			:style="`display: ${is_visible ? 'block' : 'none'};`"
			@contextmenu="() => (is_visible = false)"
		>
			<v-menu
				v-model="is_visible"
				:position-x="x_position"
				:position-y="y_position"
				absolute
			>
				<v-list color="menu" class="small-list">
					<template
						v-for="({ type, title, icon, action }, i) in items"
					>
						<v-list-item
							v-if="type === undefined || type === 'default'"
							:key="`${y_position}.${x_position}.${i}`"
							@click="action"
							dense
						>
							<v-list-item-icon
								v-if="icon"
								style="margin: 4px 12px 4px 0;"
							>
								<v-icon>{{ icon }}</v-icon>
							</v-list-item-icon>
							<v-list-item-action class="context-menu-action">
								{{ title }}
							</v-list-item-action>
						</v-list-item>
						<v-divider
							v-else-if="type === 'divider'"
							:key="`divider.${y_position}.${x_position}.${i}`"
						/>
					</template>
				</v-list>
			</v-menu>
		</v-overlay>
	</div>
</template>

<script>
export default {
	name: 'context-menu-main',
	data() {
		return {}
	},
	computed: {
		is_visible: {
			get() {
				return this.$store.state.ContextMenu.is_visible
			},
			set(value) {
				this.$store.commit('setContextMenuVisibility', value)
			},
		},
		x_position() {
			return this.$store.state.ContextMenu.x_position
		},
		y_position() {
			return this.$store.state.ContextMenu.y_position
		},
		items() {
			return this.$store.state.ContextMenu.menu
		},
	},
}
</script>

<style>
.small-list .context-menu-action {
	margin: 0 !important;
}
</style>
