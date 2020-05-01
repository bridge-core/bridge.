<template>
	<v-menu v-model="isVisible" min-width="260px" offset-y tile z-index="11">
		<template v-slot:activator="{ on }">
			<MenuButton v-on="on" :displayIcon="displayIcon" :displayName="displayName" />
		</template>

		<MenuList :elements="elements" />
	</v-menu>
</template>

<script>
import MenuList from './MenuList'
import MenuButton from './Button'
export default {
	name: 'MenuActivator',
	components: {
		MenuList,
		MenuButton,
	},
	props: {
		displayName: String,
		displayIcon: String,
		elements: Array,
	},
	data: () => ({
		isVisible: false,
	}),

	mounted() {
		this.$root.$on('anvil:closeAllAppMenus', this.closeMenu)
	},
	destroyed() {
		this.$root.$off('anvil:closeAllAppMenus', this.closeMenu)
	},

	methods: {
		closeMenu() {
			this.isVisible = false
		},
	},
}
</script>
