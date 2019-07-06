/**
 * Responsible for providing fast access to important data like entity identifiers, entity event names,
 * created animation controllers etc.
 */

import FileType from "./FileType";
import { readJSON, writeJSON } from "../utilities/JsonFS";
import { BASE_PATH } from "../constants";
import path from "path";
import OmegaCache from "./OmegaCache";
import JSONTree from "./JsonTree";
import fs from "fs";
import deepmerge from "deepmerge";

function toUnifiedObj(obj) {
    let tmp = [];
    for(let key in obj) {
        tmp.push(obj[key]);
    }
    return deepmerge.all(tmp, { ArrayMerge: (a, b) => a.concat(b) });
}

export default class LightningCache {
    static async add(file_path, content) {
        if(!content instanceof JSONTree) return;
        let type = FileType.get(file_path);
        if(type === "unknown") return;

        let global_cache, defs = await FileType.getLightningCacheDefs(file_path);
        try {
            global_cache = await readJSON(path.join(BASE_PATH, OmegaCache.project, "bridge/.lightning_cache"));
        } catch(e) {
            global_cache = {};
        }
        let cache_key = OmegaCache.toCachePath(file_path, false);
        if(global_cache[type] === undefined) global_cache[type] = {};
        if(global_cache[type][cache_key] === undefined) global_cache[type][cache_key] = {};
        let cache = global_cache[type][cache_key];

        defs.forEach(def => {
            if(def.path !== undefined) {
                try {
                    let data = content.get(def.path).toJSON();
                    if(Array.isArray(data)) {
                        cache[def.key] = data;
                    } else if(typeof data === "object") {
                        cache[def.key] = Object.keys(data);
                    } else {
                        cache[def.key] = [ data ];
                    }
                } catch(e) {
                    cache[def.key] = [];
                }
            } else if(def.search !== undefined) {
                let res = [];
                def.search.locations.forEach(l => {
                    let n = content.get(l);
                    if(n === undefined) return;

                    n.forEach(c => {
                        if(c.key === def.search.key) {
                            if(def.search.data !== undefined) c = c.get(def.search.data);

                            let data = c.toJSON();
                            if(Array.isArray(data)) {
                                res.push(...data);
                            } else if(typeof data === "object") {
                                res.push(...Object.keys(data));
                            } else {
                                res.push(data);
                            }
                        }
                    });
                });
                cache[def.key] = res;
            } else {
                console.warn("Unknown cache definition: ", def);
            }
        });

        await writeJSON(path.join(BASE_PATH, OmegaCache.project, "bridge/.lightning_cache"), global_cache);
    }
    static async load() {
        return await readJSON(path.join(BASE_PATH, OmegaCache.project, "bridge/.lightning_cache"));
    }
    static loadSync() {
        return JSON.parse(fs.readFileSync(path.join(BASE_PATH, OmegaCache.project, "bridge/.lightning_cache")).toString());
    }

    static async getCompiled() {
        let global_cache = await this.load();
        let res = {};

        for(let key in global_cache) {
            res[key] = toUnifiedObj(global_cache[key]);
        }

        return res;
    }
    static getCompiledSync() {
        let global_cache = this.loadSync();
        let res = {};

        for(let key in global_cache) {
            res[key] = toUnifiedObj(global_cache[key]);
        }

        return res;
    }

    static async rename(old_path, new_path) {
        let type = FileType.get(file_path);
        if(type === "unknown") return;

        let global_cache = await readJSON(path.join(BASE_PATH, OmegaCache.project, "bridge/.lightning_cache"));
        global_cache[type][OmegaCache.toCachePath(new_path, false)] = global_cache[type][OmegaCache.toCachePath(old_path, false)];
        global_cache[type][OmegaCache.toCachePath(old_path, false)] = null;
        await writeJSON(file_path, global_cache);
    }
    static async delete(file_path) {
        let type = FileType.get(file_path);
        if(type === "unknown") return;

        let global_cache = await readJSON(path.join(BASE_PATH, OmegaCache.project, "bridge/.lightning_cache"));
        global_cache[type][OmegaCache.toCachePath(file_path, false)] = null;
        await writeJSON(file_path, global_cache);
    }
}