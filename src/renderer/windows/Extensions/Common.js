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
        if(this.data !== undefined) return this.data;
        this.data = await fetch(WEB_APP_PLUGINS + "/plugins.json")
            .then(raw => raw.json())
            .then(data => data.map(({ author, version, tags, ...other }) => ({ author, version, tags: [ `v${version}`, author ].concat(tags || []), ...other })));
        return this.data;
       
    }
    
    static setSessionInstalled(id, version) {
        this.session_installed[id] = version;
    }

    static close() {
        this.data = undefined;
    }
}