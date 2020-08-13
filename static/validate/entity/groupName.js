const { Node, GlobalNode, LightningCache, Tab } = Bridge

let ComponentGroupsNode

const validateGroup = () => {
	Node.error = undefined

	//Validate group data type
	if (Node.children.length > 0 || Node.data === '') {
		Node.error = {
			show: true,
			message: 'Component group name must be a string',
			fix: {
				run: () => {
					Node.edit(Node.children[0].key, true)
					Node.remove(Node.children[0].key, true)
					Tab.setUnsaved()
					validateGroup()
				},
			},
		}
		return
	}

	//Validate group name
	let componentGroups = []

	ComponentGroupsNode = GlobalNode.get(
		'#;bridge_node_skip;#/component_groups'
	)
	if (ComponentGroupsNode) {
		ComponentGroupsNode.on.change.set(Node, validateGroup)
		componentGroups = Object.keys(ComponentGroupsNode.toJSON())
	}

	if (!componentGroups.includes(Node.data)) {
		Node.error = {
			show: true,
			message: 'Unknown component group',
			fix: {
				run: () => {
					GlobalNode.buildFromObject(
						{
							[Bridge.FileType === 'entity'
								? 'minecraft:entity'
								: 'bridge:tag']: {
								component_groups: {
									[Node.data]: {},
								},
							},
						},
						undefined,
						true,
						true
					)

					Tab.setUnsaved()
					Node.updateUUID()
				},
			},
		}
	}
}

Node.on.destroy.set(
	Node,
	() => ComponentGroupsNode && ComponentGroupsNode.on.change.delete(Node)
)
validateGroup()
