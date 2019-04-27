class BridgePlugin {
    constructor({ Window, FileSytem, Sidebar, AppMenu, BuildableFile, Cache, Event, AdvancedForm }) {
        this.my_window = new Window({
            title: "Test",
            content: [
                {
                    text: "My test content"
                }
            ]
        });
        this.my_window.update({
            options: {
                is_visible: true
            }
        })

        AppMenu({
            data: "here"
        });

        Event.on("bridge:saveFile", () => {

        })
    }
}

Bridge.registerPlugin({
    plugin: BridgePlugin,
    with: {
        LoadingWindow: Bridge.use("Core.LoadingWindow"),
        AdvancedForm: Bridge.use("Solved.Window.AdvancedForm")
    },
    provide: {
        "Solved.Example.BridgePlugin": BridgePlugin
    },
    data: {
        id: "solved.examples.new_plugin_api.js",
        author: "solvedDev",
        title: "Test Plugin",
        description: "Showcase of a new plugin syntax for bridge.",
        version: "1.0.0"
    }
});
Bridge.openConsole();