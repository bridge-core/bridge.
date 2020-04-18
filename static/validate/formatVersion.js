const ERROR = {
    show: true,
    message: `Invalid ${fileType} format version`
}
const DATA = {
    client_entity: ["1.8.0", "1.10.0"],
    rp_animation: ["1.10.0"],
    rp_animation_controller: ["1.10.0"],
    animation: ["1.10.0"],
    animation_controller: ["1.10.0"],
    render_controller: ["1.8.0"]
}

Node.error = undefined
if (DATA[fileType] && !DATA[fileType].includes(Node.data)) {
    Node.error = ERROR
}