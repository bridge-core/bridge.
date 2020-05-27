<template>
	<v-list
		color="expanded_sidebar"
		:style="
			`border-right: 1px solid ${
				isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
			} !important;`
		"
		height="100%"
	>
		<h2>{{ currentSidebar.displayName }}</h2>
		<v-divider />

		<SidebarContent :component="currentSidebar.component" />
	</v-list>
</template>

<script>
import SidebarContent from './Content/Main'
import { SidebarState } from './state'

export default {
	name: 'SidebarMain',
	components: {
		SidebarContent,
	},
	computed: {
		currentSidebar() {
			return SidebarState.sidebarElements[SidebarState.currentState]
		},
		isDarkMode() {
			return this.$store.state.Appearance.is_dark_mode
		},
	},
}
</script>

<style scoped>
h2 {
	padding-left: 0.25em;
}
</style>
