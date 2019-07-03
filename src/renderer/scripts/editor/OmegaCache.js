import { BASE_PATH, RP_BASE_PATH } from "../constants";
import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";

export default class OmegaCache {
    static init(project) {
        this.project = project;
        this.current_base = path.join(BASE_PATH, project, "bridge/cache");
        fs.mkdir(this.current_base, (err) => {
            if(err) console.log("[O.CACHE] Did not create new cache folder: ", err.message);
        });
    }

    static mayBeCached(file_path) {
        console.log(`[O.CACHE] Comparing ${file_path} and ${BASE_PATH}`)
        return file_path.includes(BASE_PATH) || file_path.includes(RP_BASE_PATH);
    }
    static toCachePath(file_path) {
        if(!file_path) throw new Error("[O.CACHE] Called OmegaCache.toCachePath(..) with falsy argument. Expected string");
        if(this.current_base === undefined) throw new Error("[O.CACHE] Called OmegaCache.toCachePath(..) before calling OmegaCache.init(..)");

        let tmp_path = file_path.replace(BASE_PATH, "").replace(RP_BASE_PATH, "").split(this.project);
        return path.join(this.current_base, tmp_path.pop());
    }

    static isCacheFresh(file_path) {
        return new Promise((resolve, reject) => {
            fs.stat(this.toCachePath(file_path), (err, cache_stats) => {
                if(err) return resolve(false);
                fs.stat(file_path, (err, other_stats) => {
                    if(err) console.log(err);
                    console.log(cache_stats.mtime, other_stats.mtime, cache_stats.mtimeMs - other_stats.mtimeMs >= 0);
                    resolve(cache_stats.mtimeMs - other_stats.mtimeMs + (1000 * 60 * 2) >= 0);
                })
            })
        })
    }

    static load(file_path) {
        return new Promise((resolve, reject) => {
            fs.readFile(this.toCachePath(file_path), (err, data) => {
                if(err) reject(err);
                else resolve(JSON.parse(data.toString()));
            });
        });
    }
    static save(file_path, data) {
        return new Promise((resolve, reject) => {
            mkdirp(path.dirname(this.toCachePath(file_path)), (err) => {
                fs.writeFile(this.toCachePath(file_path), JSON.stringify(data), (err) => {
                    if(err) return reject("[O.CACHE] Error calling OmegaCache.save(..): ", err.message);
                    else resolve();
                    console.log("Cached file " + file_path);
                });
            });
        });
    }
    static clear(file_path) {
        fs.unlink(this.toCachePath(file_path), (err) => {
            if(err) throw new Error("[O.CACHE] Error calling OmegaCache.clear(..): ", err.message);
        });
    }
    static rename(old_path, new_path) {
        if(!this.mayBeCached(new_path))
            return this.clear(old_path);
        
        fs.rename(this.toCachePath(old_path), this.toCachePath(new_path), (err) => {
            if(err) throw new Error("[O.CACHE] Error calling OmegaCache.rename(..): ", err.message);
        });
    }
}