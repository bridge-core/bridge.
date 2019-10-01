import { WEB_APP_PLUGINS } from "../../scripts/constants";

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
                "folder": "bridge.ui"
            },
            {
                "author": "bridge. Team",
                "version": "1.0.0",
                "name": "Bridge ConfirmWindow",
                "description": "Utility for other plugins. Uses bridge.ui.common_window to construct a confirm dialog.",
                "folder": "bridge.ui",
                "dependencies": [
                    "bridge.ui.common_window"
                ]
            },
            {
                "author": "solvedDev",
                "version": "1.0.0",
                "name": "Dynamic JSON",
                "min_app_version": "v0.7.0",
                "description": "A compiler which can speed up creating repetitive JSON by writing loop statements and shared data inside the new \"variables\" state."
            },
            {
                "author": "solvedDev",
                "version": "1.0.0",
                "name": "Dynamic Function",
                "min_app_version": "v0.7.0",
                "description": "Adds the new /dynamicfunction & /func command which can be used to pass arguments to a .mcfunction file."
            },
            {
                "author": "bridge. Team",
                "version": "1.0.1",
                "name": "Bridge Plugin Creator",
                "description": "Adds bridge. plugin files to bridge.'s native file creation window.",
                "tags": [ "Verified", "Curated" ]
            },
            {
                "name": "Console",
                "author": "solvedDev",
                "version": "1.1.4",
                "description": "Utility module to bring a console to bridge. plugins."
            },
            {
                "name": "Crash Indicator",
                "author": "solvedDev",
                "version": "1.1.5",
                "description": "Displays which entities may cause crashes."
            },
            {
                "name": "File Search",
                "author": "solvedDev",
                "version": "1.1.4",
                "description": "Quickly search all files of a project for specific keywords."
            }
        ].map(({ author, version, tags, ...other }) => ({ author, version, tags: [ version, author ].concat(tags || []), ...other }))
    }

    static close() {
        this.data = undefined;
    }
}