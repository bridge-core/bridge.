/**
 * A thin wrapper around the cached .json files ("./cache" folder)
 */

import { BASE_PATH, RP_BASE_PATH } from "../constants";
import fs from "fs";
import fse from "fs-extra";
import path from "path";
import mkdirp from "mkdirp";
import FileType from "./FileType";
import PluginEnv from "../plugins/PluginEnv";
import { readJSON } from "../utilities/JsonFS";

export default class OmegaCache {
    static init(project) {
        if(project === undefined) return console.warn("Called OmegaCache.init(..) with undefined project. Stopped initialization");

        this.project = project;
        this.current_base = path.join(BASE_PATH, project, "bridge/cache");
        fs.mkdir(this.current_base, (err) => {
            // if(err) console.error("[O.CACHE] Did not create new cache folder: ", err.message);
        });
    }

    static mayBeCached(file_path) {
        const rel_bp = path.relative(BASE_PATH.slice(0, BASE_PATH.length - 1), file_path);
        const rel_rp = path.relative(RP_BASE_PATH.slice(0, RP_BASE_PATH.length - 1), file_path);
        return !rel_bp.startsWith('../') || !rel_rp.startsWith('../');
    }
    static toCachePath(file_path, with_base=true) {
        if(!file_path) throw new Error("[O.CACHE] Called OmegaCache.toCachePath(..) with falsy argument. Expected string");
        if(this.current_base === undefined) throw new Error("[O.CACHE] Called OmegaCache.toCachePath(..) before calling OmegaCache.init(..)");

        const rel_bp = path.relative(BASE_PATH.slice(0, BASE_PATH.length - 1), file_path);
        const rel_rp = path.relative(RP_BASE_PATH.slice(0, RP_BASE_PATH.length - 1), file_path);
        const is_bp = rel_rp.startsWith("../") || rel_rp.startsWith("..\\");
        const tmp_path = is_bp ? rel_bp : rel_rp;

        return path.join(with_base ? this.current_base : "", is_bp ? "BP" : "RP", tmp_path.slice(this.project.length)).replace(/\\/g, '/');
    }

    static extractFileVersion(file_path, file_str, comment_char=FileType.getCommentChar(file_path), initial=true) { 
        try {
            let str = file_str.split("\n").shift();
            let version_templ = `${comment_char}bridge-file-version: #`;

            if(str.startsWith(version_templ) && !isNaN(Number(str.replace(version_templ, "")))) {
                return Number(str.replace(version_templ, ""));
            } else if(initial && file_str.includes("bridge-file-version")) {
                //Fallback to other chars if we fail to load file_version previously (can happen after moving folders)
                return FileType.getCommentChars()
                    .map(char => this.extractFileVersion(file_path, file_str, char, false))
                    .find(val => val !== undefined);
            }
        } catch(e) {}
    }

    static isCacheFresh(file_path, cache, otherFile) {
        let file_version = this.extractFileVersion(file_path, otherFile);
        console.log(file_version, cache.file_version)
        if(file_version !== undefined) {
            if(file_version <= cache.file_version) return true;
            else return false;
        } else {
            if(cache.file_version !== undefined) return false;
            else return true;
        }
    }

    static load(file_path) {
        return new Promise((resolve, reject) => {
            fs.readFile(this.toCachePath(file_path), (err, data) => {
                if(err) reject(err);
                else resolve(JSON.parse(data.toString()));
            });
        });
    }
    static async loadFileUUID(file_path) {
        try {
            return (await readJSON(this.toCachePath(file_path))).file_uuid;
        } catch(e) {
            return "generic";
        }
    }
    static async loadFileVersion(file_path) {
        try {
            return (await readJSON(this.toCachePath(file_path))).file_version;
        } catch(e) {
            return 0;
        }
    }
    static save(file_path, data) {
        return new Promise((resolve, reject) => {
            mkdirp(path.dirname(this.toCachePath(file_path)), (err) => {
                fs.writeFile(
                    this.toCachePath(file_path), JSON.stringify({
                        ...PluginEnv.trigger("bridge:cacheFile", { file_path, file_type: FileType.get(file_path) }), 
                        ...data 
                    }, null, "\t"),
                    (err) => {
                        if(err) return reject("[O.CACHE] Error calling OmegaCache.save(..): ", err.message);
                        else resolve();
                        // console.log("Cached file " + file_path);
                    }
                );
            });
        });
    }
    
    static clear(file_path) {
        fs.unlink(this.toCachePath(file_path), (err) => {});
    }
    static async rename(old_path, new_path) {
        if(!this.mayBeCached(new_path))
            return this.clear(old_path);
        
        await fse.move(this.toCachePath(old_path), this.toCachePath(new_path));
    }
    static duplicate(what, as) {
        if(!this.mayBeCached(as))
            return;

        fs.copyFile(this.toCachePath(what), this.toCachePath(as), (err) => {});
    }
}
