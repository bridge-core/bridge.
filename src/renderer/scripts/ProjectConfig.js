import { CURRENT } from "./constants";
import path from "path";
import { readJSON, writeJSON, readJSONSync } from "./utilities/JsonFS";

export default class ProjectConfig {
    static get config_path() {
        return path.join(CURRENT.PROJECT_PATH, "bridge/config.json");
    }

    //PREFIX
    static getPrefixSync() {
        try {
            return readJSONSync(this.config_path).prefix || "bridge";
        } catch(e) {
            return "bridge";
        }
        
    }
    static get prefix() {
        return (async () => {
            return (await readJSON(this.config_path)).prefix;
        })();
    }
    static set prefix(val) {
        return (async () => {
            let data;
            try { data = await readJSON(this.config_path) }
            catch(e) { data = {} }

            await writeJSON(this.config_path, {
                ...data,
                prefix: val
            });
        })();
    }
}