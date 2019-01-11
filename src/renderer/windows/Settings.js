import TabWindow from "../scripts/commonWindows/TabWindow";
import Store from "../store/index";
import BridgeStore from "../scripts/utilities/BridgeStore";

class ReactiveSwitch {
    constructor(parent, watch_key) {
        this.type = "switch";
        this.text = "Asserts";
        this.color = "error";
        this.input = parent.data.is_dev_mode;

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
                icon: "mdi-cogs",
                title: "Developer mode"
            },
            content: [
                new ReactiveSwitch(this, "is_dev_mode")
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
                is_dev_mode: false
            });
        }

        this.data = this.store.load("settings");      
    }
    save() {
        Store.commit("setSettings", this.data);
        this.store.save("settings", this.data);
    }
}