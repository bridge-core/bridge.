/**
 * Save data per project inside a "bridge/config.json" file
 */
import { CURRENT } from "./constants";
import path from "path";
import { readJSON, writeJSON, readJSONSync } from "./utilities/JsonFS";
import SETTINGS from "../store/Settings";

export default class ProjectConfig {
    static get config_path() {
        return path.join(CURRENT.PROJECT_PATH, "bridge/config.json");
    }
    static prefix_cache: string;

    //PREFIX
    static getPrefixSync() {
        try {
            if(this.prefix_cache === undefined) this.prefix_cache = (readJSONSync(this.config_path).prefix || "bridge");
            return this.prefix_cache;
        } catch(e) {
            return "bridge";
        }
        
    }
    static get prefix() {
        return (async () => {
            return (await readJSON(this.config_path)).prefix;
        })();
    }
    static setPrefix(val: string) {
        (async () => {
            let data;
            try { data = await readJSON(this.config_path) }
            catch(e) { data = {} }
            this.prefix_cache = val;

            await writeJSON(this.config_path, {
                ...data,
                prefix: val
            });
        })();
    }

    static get theme() {
        return (async () => {
            return (await readJSON(this.config_path)).theme[SETTINGS.load().id] || "bridge.default.theme";
        })();

        
    }
    static setTheme(val: string) {
        (async () => {
            let data;
            try { data = await readJSON(this.config_path) }
            catch(e) { data = {} }

            await writeJSON(this.config_path, {
                ...data,
                theme: {
                    ...(data.theme || {}),
                    [SETTINGS.load().id]: val
                }
            });
        })();
    }
}