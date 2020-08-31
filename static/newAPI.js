//New API
const {
	register,
	template,
	propose,
	scope,
	name,
} = await require('@bridge/custom-component')

register(({ component, value }, location) => {
	name('bridge:set_variant')
	scope('entityComponent') // blockComponent, entityComponent, itemComponent

	template(
		{
			[`minecraft:${component}`]: {
				value,
			},
		},
		location
	)

	propose({
		component: ['mark_variant', 'variant', 'skin_id'],
		value: '$general.number',
	})
})

//Old API
Bridge.register(
	class Component {
		static component_scope = 'entityComponent' //Not supported yet
		static component_name = 'bridge:set_variant'

		onApply({ component, value }, location) {
			const componentTemplate = {
				[`minecraft:${component}`]: {
					value,
				},
			}

			if (location === 'components')
				return {
					'minecraft:entity': {
						components: componentTemplate,
					},
				}
			else
				return {
					'minecraft:entity': {
						component_groups: {
							[location]: componentTemplate,
						},
					},
				}
		}

		onPropose() {
			return {
				[Component.component_name]: {
					component: ['mark_variant', 'variant', 'skin_id'],
					value: '$general.number',
				},
			}
		}
	}
)
