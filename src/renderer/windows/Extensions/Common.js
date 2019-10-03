import { WEB_APP_PLUGINS, CURRENT } from "../../scripts/constants";
import { readJSONSync } from "../../scripts/utilities/JsonFS";
import { promises as fs } from "fs";
import path from "path";
import Notification from '../../scripts/Notification';
import PluginLoader from "../../scripts/plugins/PluginLoader";
import LoadingWindow from "../LoadingWindow";
import EventBus from "../../scripts/EventBus";

export const EXT_TAG_MAP = readJSONSync(path.join(__static, "data/ext_tag_map.json"));

export function tag(tag_name, index) {
    return  (EXT_TAG_MAP[tag_name] || EXT_TAG_MAP[`${index}`] || {});
}
export async function download(url) {
    await fetch(WEB_APP_PLUGINS + url)
        .then(data => data.arrayBuffer())
        .then(async data => {
            await fs.mkdir(path.join(CURRENT.PROJECT_PATH, "bridge/plugins"), { recursive: true });
            await fs.writeFile(path.join(CURRENT.PROJECT_PATH, "bridge/plugins", path.basename(url)), new Buffer(data));
            RELOAD_NOTIFICATION.send();
        })
        .catch(console.error)
}
export const RELOAD_NOTIFICATION = new Notification({ 
    display_name: "Reload Plugins", 
    color: "primary", 
    display_icon: "mdi-refresh",
    action: async () => {
        RELOAD_NOTIFICATION.remove();
        let lw = new LoadingWindow().show();
        await PluginLoader.loadPlugins(CURRENT.PROJECT)
        lw.close(); 
    }
});

export function getInfoMap() {
    let res = {};

    for(let { id, version } of PluginLoader.getInstalledPlugins()) {
        res[id] = version;
    }

    return Object.assign(res, Session.session_installed);
}

EventBus.on("bridge:pluginsLoaded", () => {
    Session.session_installed = {};
    RELOAD_NOTIFICATION.remove();
});
export default class Session {
    static data;
    static session_installed = {};

    static async open() {
        // if(this.data !== undefined) return this.data;
        // this.data = await fetch(WEB_APP_PLUGINS + "/plugins.json")
        //     .then(raw => raw.json())
        //     .then(data => Object.values(data));
        // return this.data;
        return [
            {
                "author": "bridge. Team",
                "id": "bridge.ui.common_window",
                "version": "1.0.0",
                "name": "Bridge CommonWindow",
                "description": "Utility for other plugins. Wraps the bridge. Window API into an easier to use class.",
                "link": "/plugins/bridge.ui.common_window.js",
                "tags": [ "Utility" ]
            },
            {
                "author": "bridge. Team",
                "id": "bridge.ui.confirm_window",
                "version": "1.0.0",
                "name": "Bridge ConfirmWindow",
                "description": "Utility for other plugins. Uses bridge.ui.common_window to construct a confirm dialog.",
                "link": "/plugins/bridge.ui.confirm_window.js",
                "tags": [ "Utility" ],
                "dependencies": [
                    "bridge.ui.common_window"
                ]
            },
            {
                "author": "solvedDev",
                "id": "solved.features.dynamic_json",
                "version": "1.0.0",
                "name": "Dynamic JSON",
                "min_app_version": "v0.7.0",
                "description": "A compiler which can speed up creating repetitive JSON by writing loop statements and shared data inside the new \"variables\" state.",
                "link": "/plugins/solved.features.dynamic_json.js",
                "tags": [ "Utility" ]
            },
            {
                "author": "solvedDev",
                "id": "solved.features.dynamic_function",
                "version": "1.0.0",
                "name": "Dynamic Function",
                "min_app_version": "v0.7.0",
                "description": "Adds the new /dynamicfunction & /func command which can be used to pass arguments to a .mcfunction file.",
                "link": "/plugins/solved.features.dynamic_function.js",
                "tags": [ "Utility" ]
            },
            {
                "author": "bridge. Team",
                "id": "solved.utilities.bridge_plugin_creator",
                "version": "1.0.2",
                "name": "Bridge Plugin Creator",
                "description": "Adds bridge. plugin files to bridge.'s native file creation window.",
                "link": "/plugins/solved.utilities.bridge_plugin_creator.js",
                "tags": [ "Curated", "Verified", "Utility" ]
            },
            {
                "name": "Console",
                "id": "solved.utilities.console",
                "author": "solvedDev",
                "version": "1.1.4",
                "description": "Utility module to bring a console to bridge. plugins.",
                "link": "/plugins/solved.utilities.console.js",
                "tags": [ "Utility" ]
            },
            {
                "name": "Crash Indicator",
                "id": "solved.utilities.crash_overview",
                "author": "solvedDev",
                "version": "1.1.5",
                "description": "Displays which entities may cause crashes.",
                "link": "/plugins/solved.utilities.crash_overview.js",
                "tags": [ "Utility" ]
            },
            {
                "name": "File Search",
                "id": "solved.utilities.file_search",
                "author": "solvedDev",
                "version": "1.1.4",
                "description": "Quickly search all files of a project for specific keywords.",
                "link": "/plugins/solved.utilities.file_search.js",
                "tags": [ "Utility" ]
            }
        ].map(({ author, version, tags, ...other }) => ({ author, version, tags: [ `v${version}`, author ].concat(tags || []), ...other }))
    }
    
    static setSessionInstalled(id, version) {
        this.session_installed[id] = version;
    }

    static close() {
        this.data = undefined;
    }
}