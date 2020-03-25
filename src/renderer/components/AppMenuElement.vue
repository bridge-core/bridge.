<template>
	<span v-if="!element.is_hidden">
		<v-list-item
			v-if="!element.type || element.type === 'standard'"
			@click.stop="click()"
		>
			<v-list-item-content>
				<v-list-item-title>{{ element.title }}</v-list-item-title>
				<v-list-item-subtitle v-if="element.subtitle">
					{{ element.subtitle }}
				</v-list-item-subtitle>
			</v-list-item-content>

			<v-list-item-action v-if="element.shortcut">
				<v-list-item-action-text>
					{{
						platform === 'darwin'
							? element.shortcut.replace('Ctrl', 'Cmd')
							: element.shortcut
					}}
				</v-list-item-action-text>
			</v-list-item-action>
		</v-list-item>

		<slot
			v-else-if="element.type === 'submenu'"
			:menu="{ elements: element.elements }"
			:submenu="element"
		></slot>

		<v-divider v-else></v-divider>
	</span>
</template>

<script>
import AppMenu from './AppMenu.vue'
import { platform } from 'os'

export default {
	name: 'app-menu-element',
	props: {
		element: Object,
	},

	components: {
		AppMenu: AppMenu,
	},
	computed: {
		platform() {
			return platform()
		},
	},
	methods: {
		click(action = this.element.action) {
			this.$root.$emit('close-all-menus')
			if (typeof action !== 'function') return () => {}
			return action()
		},
	},
}
</script>
