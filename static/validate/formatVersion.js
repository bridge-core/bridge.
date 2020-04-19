const {
    Node,
    FileType,
    Tab
} = Bridge

const DATA = {
    client_entity: ['1.8.0', '1.10.0'],
    attachable: ['1.10.0'],
    rp_animation: ['1.8.0'],
    rp_animation_controller: ['1.10.0'],
    animation: ['1.10.0'],
    animation_controller: ['1.10.0'],
    render_controller: ['1.8.0'],
    particle: ['1.10.0']
}

//Delete previously found error
Node.error = undefined
//Check whether format version is invalid
if (Node.data === '' || (DATA[FileType] && !DATA[FileType].includes(Node.data))) {
    //Report error to user
    Node.error = {
        show: true,
        message: `Invalid ${FileType} format version`,
        fix: {
            //Provide auto-fix
            run: () => {
                //Grab the most recent defined format_version or use '1.13.0' to fix the error
                Bridge.Node.edit((DATA[FileType] || [])[(DATA[FileType] || []).length - 1] || '1.13.0', true)
                Tab.setUnsaved()
            }
        }
    }
}