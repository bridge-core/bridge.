const {
    Node,
    LightningCache,
    Tab
} = Bridge

Node.error = undefined
if (Node.data === '') {
    Node.error = {
        show: true,
        message: `Invalid event target`,
        fix: {
            run: () => {
                Node.edit("self", true)
                Tab.setUnsaved()
            }
        }
    }
}