const { Node, GlobalNode, LightningCache } = Bridge

let EventsNode
let TargetNode

const addListeners = () => {
	if (Node) Node.parent.on.change.set(Node, validateEvent)
	if (EventsNode) EventsNode.on.change.set(Node, validateEvent)
	if (TargetNode) TargetNode.on.change.set(Node, validateEvent)
}
const clearListeners = () => {
	if (Node) Node.parent.on.change.delete(Node)
	if (TargetNode) TargetNode.on.change.delete(Node)
	if (EventsNode) EventsNode.on.change.delete(Node)
}
const validateEvent = () => {
	if (!EventsNode) EventsNode = GlobalNode.get('#;bridge_node_skip;#/events')
	if (!TargetNode) TargetNode = Node.parent.get('target')

	LightningCache.then(cache => {
		let allEvents = (cache.entity || {}).events || []
		let localEvents = []

		if (EventsNode) localEvents = Object.keys(EventsNode.toJSON())

		const target = (
			TargetNode || {
				data: 'self',
			}
		).data

		if (
			(target === 'self' && localEvents.includes(Node.data)) ||
			allEvents.includes(Node.data)
		) {
			if (target !== 'self') clearListeners()
			Node.error = undefined
		} else {
			addListeners()
			Node.error = {
				show: true,
				message: `Unknown event`,
			}
		}
	})
}

Node.on.destroy.set(Node, clearListeners)
validateEvent()
