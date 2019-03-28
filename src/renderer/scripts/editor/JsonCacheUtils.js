//@ts-check
import FileSystem from "../FileSystem";
import JSONTree from "./JsonTree";

export default class JsonCacheUtils {
    static get CACHE() {
        return FileSystem.Cache.getCacheSync(true);
    }
    static get CACHE_ITEMS() {
        let res = [];
        for(let file_id in this.CACHE) {
            if(this.CACHE[file_id].format_version === 1)
                res.push(JSONTree.buildFromCache(this.CACHE[file_id].content))
        }
        return res;
    }

    static get families() {
        let res = [];
        this.CACHE_ITEMS.forEach(c => {
            res = res.concat(c.searchAll("minecraft:type_family"));
        });
        return res.map(e => e.toJSON().family).reduce((acc, val) => acc.concat(val), []);
    }

    static get events() {
        let res = [];
        this.CACHE_ITEMS.forEach(c => {
            let events = c.get("minecraft:entity/events");
            if(events !== undefined) {
                res = res.concat(Object.keys(events.toJSON()));
            }
        });
        return res;
    }

    static get animation_references() {
        let res = [];
        this.CACHE_ITEMS.forEach(c => {
            let refs = c.get("minecraft:entity/description/animations");
            if(refs !== undefined) {
                res = res.concat(Object.keys(refs.toJSON()));
            }
        });
        return res;
    }

    static get animation_ids() {
        let res = [];
        this.CACHE_ITEMS.forEach(c => {
            let a = c.get("animations");
            if(a !== undefined) {
                res = res.concat(Object.keys(a.toJSON()));
            }
        });
        return res;
    }
    static get animation_controller_ids() {
        let res = [];
        this.CACHE_ITEMS.forEach(c => {
            let a = c.get("animation_controllers");
            if(a !== undefined) {
                res = res.concat(Object.keys(a.toJSON()));
            }
        });
        return res;
    }
}