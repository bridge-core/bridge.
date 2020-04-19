const {
    Node,
    FileType,
    Tab
} = Bridge

const nameStart = FileType === 'render_controller' ? 'controller.render.' : (FileType.endsWith('animation_controller') ? 'controller.animation.' : 'animation.')

const validateKeys = () => {
    Node.children.forEach(n => {
        n.error = undefined
        if (!n.key.startsWith(nameStart)) {
            n.error = {
                show: true,
                message: `Invalid ${FileType} name`,
                fix: {
                    run: () => {
                        n.editKey(`${nameStart}${n.key}`, true)
                        n.error = undefined
                        Tab.setUnsaved()
                    }
                }
            }
        }
    })
}

Node.on.change.set(Node, validateKeys)
validateKeys()