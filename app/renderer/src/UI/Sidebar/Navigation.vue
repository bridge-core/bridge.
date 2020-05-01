<template>
	<v-navigation-drawer
		:style="`max-height: ${navHeight - 56}px;`"
		fixed
		mini-variant-width="60"
		mini-variant
		stateless
		:value="true"
		app
	>
		<v-list
			color="sidebar_navigation"
			:style="`height: 100%; max-height: ${navHeight - 56}px;`"
		>
			<SidebarButton
				v-for="(sidebar, uuid) in SidebarState.sidebarElements"
				:key="`${SidebarState.currentState}.${uuid}`"
				:displayName="sidebar.displayName"
				:icon="sidebar.icon"
				:opacity="sidebar.opacity"
				:isSelected="sidebar.isSelected"
				@click="sidebar.toggle()"
			/>
		</v-list>
	</v-navigation-drawer>
</template>

<script>
import SidebarButton from './Button'
import { SidebarState } from './state'
import { setupSidebar } from './setup'

export default {
	name: 'SidebarNavigation',
	components: {
		SidebarButton,
	},
	created() {
		window.addEventListener('resize', this.onResize)
		setupSidebar()
	},
	destroyed() {
		window.removeEventListener('resize', this.onResize)
	},
	data() {
		return {
			navHeight: window.innerHeight,
			SidebarState,
		}
	},
	methods: {
		onResize() {
			this.navHeight = window.innerHeight
		},
	},
}
</script>

<style scoped>
.v-list {
	overflow-y: auto;
	overflow-x: hidden;
}
</style>
<style>
.v-navigation-drawer--fixed {
	z-index: 0;
}
</style>
