import TabWindow from "../scripts/commonWindows/TabWindow";

export default class SettingsWindow extends TabWindow {
    constructor() {
        super("Settings", {}, "bridge.core.settings_window.");
        this.addTab({
            sidebar_element: {
                icon: "mdi-cogs",
                title: "Developer mode"
            }
        });
        this.addTab({
            sidebar_element: {
                icon: "mdi-code-braces",
                title: "Editor"
            }
        });
        this.update();
    }
}