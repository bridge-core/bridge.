import { WEB_APP_PLUGINS, CURRENT } from "../../scripts/constants";
import { readJSONSync } from "../../scripts/utilities/JsonFS";
import { promises as fs } from "fs";
import path from "path";
import Notification from '../../scripts/Notification';
import PluginLoader from "../../scripts/plugins/PluginLoader";
import LoadingWindow from "../LoadingWindow";

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
export default class Session {
    static data;

    static async open() {
        // if(this.data !== undefined) return this.data;
        // this.data = await fetch(WEB_APP_PLUGINS + "/plugins.json")
        //     .then(raw => raw.json())
        //     .then(data => Object.values(data));
        // return this.data;
        return [
            {
                "author": "bridge. Team",
                "version": "1.0.0",
                "name": "Bridge CommonWindow",
                "description": "Utility for other plugins. Wraps the bridge. Window API into an easier to use class.",
                "link": "/plugins/bridge.ui.common_window.js",
                "tags": [ "Utility" ]
            },
            {
                "author": "bridge. Team",
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
                "version": "1.0.0",
                "name": "Dynamic JSON",
                "min_app_version": "v0.7.0",
                "description": "A compiler which can speed up creating repetitive JSON by writing loop statements and shared data inside the new \"variables\" state.",
                "link": "/plugins/solved.features.dynamic_json.js",
                "tags": [ "Utility" ]
            },
            {
                "author": "solvedDev",
                "version": "1.0.0",
                "name": "Dynamic Function",
                "min_app_version": "v0.7.0",
                "description": "Adds the new /dynamicfunction & /func command which can be used to pass arguments to a .mcfunction file.",
                "link": "/plugins/solved.features.dynamic_function.js",
                "tags": [ "Utility" ]
            },
            {
                "author": "bridge. Team",
                "version": "1.0.1",
                "name": "Bridge Plugin Creator",
                "description": "Adds bridge. plugin files to bridge.'s native file creation window.",
                "link": "/plugins/solved.utilities.bridge_plugin_creator.js",
                "tags": [ "Curated", "Verified", "Utility" ]
            },
            {
                "name": "Console",
                "author": "solvedDev",
                "version": "1.1.4",
                "description": "Utility module to bring a console to bridge. plugins.",
                "link": "/plugins/solved.utilities.console.js",
                "tags": [ "Utility" ]
            },
            {
                "name": "Crash Indicator",
                "author": "solvedDev",
                "version": "1.1.5",
                "description": "Displays which entities may cause crashes.",
                "link": "/plugins/solved.utilities.crash_overview.js",
                "tags": [ "Utility" ]
            },
            {
                "name": "File Search",
                "author": "solvedDev",
                "version": "1.1.4",
                "description": "Quickly search all files of a project for specific keywords.",
                "link": "/plugins/solved.utilities.file_search.js",
                "tags": [ "Utility" ]
            }
        ].map(({ author, version, tags, ...other }) => ({ author, version, tags: [ `v${version}`, author ].concat(tags || []), ...other }))
    }

    static close() {
        this.data = undefined;
    }
}