import BridgeStore from "../scripts/utilities/BridgeStore";
import VueStore from "./index";

let STORE;
if(process.env.NODE_ENV == "development") STORE = new BridgeStore(__dirname + "/", "data");
else STORE = new BridgeStore(__dirname.split("app.asar\\")[0], "data");
let DATA;

function setup() {
    if(!STORE.exists("settings")) {
        console.log("[SETTING STORE] Not found - creating new store with default values");
        STORE.setup("data");
        save({
            is_dev_mode: false,
            is_dark_mode: true,
            inversed_arrows: false,
            use_tabs: true,
            line_wraps: false,
            auto_completions: true,
            open_all_nodes: false,
            default_project: "",
            target_version: ""
        });
    }

    DATA = STORE.load("settings");
    VueStore.commit("setSettings", DATA);
    VueStore.commit("setDarkMode", DATA.is_dark_mode);
}
function save(settings) {
    DATA = settings;
    STORE.save("settings", settings);
}
function load() {
    return DATA;
}

export default {
    load: () => load(),
    save: (s) => save(s),
    setup: () => setup()
}