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
    static global_cache = undefined;
    static compiled_cache = undefined;
    static get l_cache_path() {
        return path.join(BASE_PATH, OmegaCache.project, "bridge/.lightning_cache");
    }
    static init() {
        this.global_cache = undefined;
    }

    static async add(file_path, content) {
        if(!(content instanceof JSONTree)) return;
        let type = FileType.get(file_path);
        if(type === "unknown") return;

        let defs = await FileType.getLightningCacheDefs(file_path);
        if(defs === undefined) return;
        if(defs.as !== undefined) {
            type = defs.as;
            defs = defs.definitions;
        }
        if(this.global_cache === undefined) {
            try {
                this.global_cache = await readJSON(this.l_cache_path);
            } catch(e) {
                this.global_cache = {};
            }
        }
        
        let cache_key = OmegaCache.toCachePath(file_path, false);
        if(this.global_cache[type] === undefined) this.global_cache[type] = {};
        if(this.global_cache[type][cache_key] === undefined) this.global_cache[type][cache_key] = {};
        let cache = this.global_cache[type][cache_key];

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
        
        this.compiled_cache = undefined;
        await writeJSON(this.l_cache_path, this.global_cache, true);
    }
    static async load(file_path, type) {
        if(file_path === undefined) {
            if(this.global_cache !== undefined) return this.global_cache;
            try {
                return await readJSON(this.l_cache_path);
            } catch(err) {
                return {};
            }
        } else {
            if(type === undefined) type = FileType.get(file_path);
            if(this.global_cache !== undefined) return this.global_cache[type][OmegaCache.toCachePath(file_path, false)] || {};
            try {
                return (await readJSON(this.l_cache_path))[type][OmegaCache.toCachePath(file_path, false)] || {};
            } catch(err) {
                return {};
            }
        }
    }
    static loadSync() {
        if(this.global_cache !== undefined) return this.global_cache;
        try {
            return JSON.parse(fs.readFileSync(this.l_cache_path).toString());
        } catch(err) {
            return {};
        }  
    }

    static async rename(old_path, new_path) {
        let type = FileType.get(old_path);
        if(type === "unknown") return;

        this.global_cache = await this.load();
        try {
            this.global_cache[type][OmegaCache.toCachePath(new_path, false)] = this.global_cache[type][OmegaCache.toCachePath(old_path, false)];
            delete this.global_cache[type][OmegaCache.toCachePath(old_path, false)];
        } catch(e) {}
        
        await writeJSON(this.l_cache_path, this.global_cache, true);
    }
    static async clear(file_path) {
        let type = FileType.get(file_path);
        if(type === "unknown") return;

        this.global_cache = await this.load();
        try {
            delete this.global_cache[type][OmegaCache.toCachePath(file_path, false)];
        } catch(e) {}
        await writeJSON(this.l_cache_path, this.global_cache, true);
    }

    static async getCompiled() {
        if(this.compiled_cache !== undefined) return this.compiled_cache;
        let cache = await this.load();
        let res = {};

        for(let key in cache) {
            if(cache[key] !== null)
                res[key] = toUnifiedObj(cache[key]);
        }

        this.compiled_cache = res;
        return res;
    }
    static getCompiledSync() {
        if(this.compiled_cache !== undefined) return this.compiled_cache;
        let cache = this.loadSync();
        let res = {};

        for(let key in cache) {
            if(cache[key] !== null)
                res[key] = toUnifiedObj(cache[key]);
        }

        this.compiled_cache = res;
        return res;
    }
}