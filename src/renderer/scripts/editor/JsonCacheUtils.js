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
            console.log(c.searchAll("minecraft:type_family"));
            res = res.concat(c.searchAll("minecraft:type_family"));
        });
        console.log(res.map(e => e.toJSON().family).reduce((acc, val) => acc.concat(val), []));
        return res.map(e => e.toJSON().family).reduce((acc, val) => acc.concat(val), []);
    }
}