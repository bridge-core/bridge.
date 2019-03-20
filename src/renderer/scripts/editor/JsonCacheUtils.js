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
}