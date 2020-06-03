<template>
	<!-- "tile" prop doesn't work on nested lists -> set border radius directly -->
	<v-list class="app-menu" style="border-radius: 0;">
		<v-menu
			v-for="({
				displayName,
				displayIcon,
				keyBinding,
				elements = [],
				onClick,
				isHidden,
			},
			i) in elements"
			:key="`menu.${i}.${Math.random()}`"
			open-on-hover
			offset-x
			tile
			z-index="11"
		>
			<template v-if="!isHidden" v-slot:activator="{ on }">
				<v-list-item
					dense
					v-on="
						!onClick &&
						(typeof elements === 'function' ? elements() : elements)
							.length > 0
							? on
							: undefined
					"
					@click="clickHandler(onClick)"
				>
					<v-list-item-icon v-if="displayIcon">
						<v-icon color="primary" small>{{ displayIcon }}</v-icon>
					</v-list-item-icon>

					<v-list-item-content>
						<v-list-item-title>{{ displayName }}</v-list-item-title>
					</v-list-item-content>

					<v-list-item-action>
						<v-list-item-action-text>
							<span v-if="keyBinding">
								{{ getStrKeyCode(keyBinding) }}
							</span>
							<v-icon
								v-if="
									elements &&
										(typeof elements === 'function'
											? elements()
											: elements
										).length > 0
								"
								small
								>mdi-chevron-right</v-icon
							>
						</v-list-item-action-text>
					</v-list-item-action>
				</v-list-item>
			</template>

			<MenuList
				:elements="
					typeof elements === 'function' ? elements() : elements
				"
			/>
		</v-menu>
	</v-list>
</template>

<script>
import { getStrKeyCode } from '../../../editor/KeyBindings/main'

export default {
	name: 'MenuList',
	props: {
		elements: Array,
	},
	mounted() {
		console.log(this.elements)
	},
	data: () => ({
		getStrKeyCode,
	}),

	methods: {
		clickHandler(onClick) {
			if (onClick) onClick()
			this.$root.$emit('anvil:closeAllAppMenus')
		},
	},
}
</script>

<style>
/**
	"tile" prop isn't working on v-menu -> manually tweak menu to not have border radius
 */
.v-menu__content {
	border-radius: 0;
}
</style>
