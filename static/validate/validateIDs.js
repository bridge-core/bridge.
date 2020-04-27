const {
    Node,
    FileType,
    Tab
} = Bridge

//Set the correct id start depending on the current file type
const nameStart = FileType === 'render_controller' ? 'controller.render.' : (FileType.endsWith('animation_controller') ? 'controller.animation.' : 'animation.')

const validateKeys = () => {
    Node.children.forEach(n => {
        //Delete previous error
        n.error = undefined

        //Id doesn't start with controller.animation./controller.render./animation.
        if (!n.key.startsWith(nameStart)) {
            //Show error to user
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