const {
    Node,
    LightningCache
} = Bridge

let GlobalNode = Node
while (GlobalNode.parent) {
    GlobalNode = GlobalNode.parent
}
let EventsNode
let TargetNode

const addListeners = () => {
    Node.parent.on.change.set(Node, validateEvent)
    if (EventsNode) EventsNode.on.change.set(Node, validateEvent)
    if (TargetNode) TargetNode.on.change.set(Node, validateEvent)

}
const clearListeners = () => {
    Node.parent.on.change.delete(Node)
    if (TargetNode) TargetNode.on.change.delete(Node)
    if (EventsNode) EventsNode.on.change.delete(Node)
}
const validateEvent = () => {
    if (!EventsNode) EventsNode = GlobalNode.get('minecraft:entity/events')
    if (!TargetNode) TargetNode = Node.parent.get('target')

    LightningCache.then(cache => {
        let all_events = (cache.entity || {}).events || []
        let local_events = []

        if (EventsNode)
            local_events = Object.keys(EventsNode.toJSON())


        const target = (TargetNode || {
            data: 'self'
        }).data

        if ((target === 'self' && local_events.includes(Node.data)) || all_events.includes(Node.data)) {
            if (target !== 'self') clearListeners()
            Node.error = undefined
        } else {
            addListeners()
            Node.error = {
                show: true,
                message: `Unknown event`
            }
        }
    })
}

Node.on.destroy.set(Node, clearListeners)
validateEvent()