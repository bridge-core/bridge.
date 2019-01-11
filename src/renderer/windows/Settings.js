import TabWindow from "../scripts/commonWindows/TabWindow";
import Store from "../store/index";
import BridgeStore from "../scripts/utilities/BridgeStore";

class ReactiveSwitch {
    constructor(parent, watch_key, def) {
        this.type = "switch";
        this.input = parent.data[watch_key];
        for(let key in def) {
            this[key] = def[key];
        }

        this.action = (val) => {
            this.input = val;
            parent.data[watch_key] = val;
            parent.save();
        };
    }
}

export default class SettingsWindow extends TabWindow {
    constructor() {     
        super("Settings", { is_persistent: false }, "bridge.core.settings_window.");
        this.createStore();
        
        this.addTab({
            sidebar_element: {
                icon: "mdi-code-braces",
                title: "Editor"
            }
        });
        this.addTab({
            sidebar_element: {
                icon: "mdi-flower-tulip",
                title: "Appearance"
            },
            content: [
                new ReactiveSwitch(this, "is_dark_mode", { color: "light-green", text: "Dark Mode" })
            ]
        });
        this.addTab({
            sidebar_element: {
                icon: "mdi-cogs",
                title: "Developer Mode"
            },
            content: [
                new ReactiveSwitch(this, "is_dev_mode", { color: "error", text: "Asserts" })
            ]
        });

        this.update();
    }

    createStore() {
        this.store = new BridgeStore(__dirname + "/", "data");
        if(!this.store.exists("settings")) {
            console.log("[SETTING STORE] Not found - creating new store with default values");
            this.store.setup("data");
            this.store.save("settings", {
                is_dev_mode: false,
                is_dark_mode: true
            });
        }

        this.data = this.store.load("settings");      
    }
    save() {
        Store.commit("setSettings", this.data);
        this.store.save("settings", this.data);
    }
}