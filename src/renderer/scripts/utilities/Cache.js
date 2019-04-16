import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
import { BASE_PATH } from "../constants.js";
import Store from "../../store/index";

function getPath(filePath) {
    return path.join(BASE_PATH, filePath);
}
function getFileId(file_path) {
    return file_path.replace(/\\/g, "/").replace(BASE_PATH.replace(/\\/g, "/"), "");
}

export default class Cache {
    constructor() {
        this.loaded_cache = undefined;
        this.cached_cache = undefined;
    }
    get project() {
        return Store.state.Explorer.project;
    }

    save(file_path, file_content, other={}, format_version=0) {
        this.getCache((cache) => {
            if(file_content != undefined) {
                cache[getFileId(file_path)] = Object.assign(cache[getFileId(file_path)] || {}, {
                    content: file_content,
                    format_version
                });
            } 
            cache[getFileId(file_path)] = Object.assign(cache[getFileId(file_path)] || {}, other);

            if(!file_path.includes(".editor-cache")) this.saveCache(cache);
            
            this.loaded_cache = this.project;
        });
    }
    get(file_path) {
        return new Promise((resolve, reject) => {
            this.getCache((cache) => {
                let id = getFileId(file_path);
                if(cache[id] == undefined) return reject(`File ${id} is not cached yet.`);
                resolve(cache[id] || {});
            });
        });
    }
    getSync(file_path) {
        return this.getCacheSync()[getFileId(file_path)];
    }
    clear(file_path) {
        this.getCache((cache) => {
            let id = getFileId(file_path);
            delete cache[id];
            this.saveCache(cache);
        });
    }

    //UPDATE
    addDependency(to, dependency) {
        return new Promise((resolve, reject) => {
            this.get(to)
                .then(cache => {
                    if(Array.isArray(cache.update) && !cache.update.includes(dependency)) cache.update.push(dependency);
                    else if(!Array.isArray(cache.update)) cache.update = [dependency];

                    this.save(to, undefined, { update: cache.update });
                    resolve(cache);
                })
                .catch(() => {
                    resolve({ content: {} });
                    this.save(to, undefined, {
                        update: [dependency]
                    })
                });
        });
        
    }
    removeDependency(from, dependency, save=true) {
        return new Promise((resolve, reject) => {
            this.get(from)
                .then(cache => {
                    if(Array.isArray(cache.update) && cache.update.includes(dependency)) cache.update.splice(cache.update.indexOf(dependency), 1);
                    else return resolve();
                    if(save) this.save(from, undefined, { update: cache.update });
                    resolve();
                })
                .catch(err => reject(err));
        });
        
    }
    removeAllDependencies(sources=[], dependency) {
        let proms = [];
        sources.forEach(
            s => proms.push(this.removeDependency(s, dependency, false))
        );
        Promise.all(proms)
            .then(() => this.saveCache())
            .catch((err) => console.log(err));
    }
    
    //WRAPPER
    saveCache(data=this.cached_cache) {
        fs.writeFile(getPath(path.join(this.project, "/bridge/.editor-cache")), JSON.stringify(data, null, "\t"), (err) => {
            if(err) throw err;
        });
    }
    getCache(cb) {
        if(this.cached_cache != undefined && this.loaded_cache == this.project) {
            cb(this.cached_cache);
            return;
        }
        let p = getPath(path.join(this.project, "/bridge"));

        fs.exists(getPath(p), (exists) => {
            if(!exists) mkdirp.sync(p);

            fs.exists(path.join(p, "/.editor-cache"), (exists_file) => {
                if(!exists_file) {
                    fs.writeFile(path.join(p, "/.editor-cache"), "{}", (err) => {
                        if(err) throw err;
                        this.cached_cache = {};
                        this.loaded_cache = this.project;
                        
                        if(typeof cb == "function") cb({});
                    });
                } else {
                    fs.readFile(path.join(p, "/.editor-cache"), (err, data) => {
                        if(err) throw err;
                        let c = data == "" ? {} : JSON.parse(data);
                        this.cached_cache = c;
                        this.loaded_cache = this.project;

                        if(typeof cb == "function") cb(c);
                    });
                }
            });
        });
    }
    getCacheSync(use_cache=false) {
        if(use_cache && this.cached_cache !== undefined && this.loaded_cache === this.project)
            return this.cached_cache;

        let p = getPath(path.join(this.project, "/bridge"));
        try {
            return JSON.parse(fs.readFileSync(path.join(p, "/.editor-cache")).toString());
        } catch(e) {
            mkdirp(p);
            fs.writeFile(path.join(p, "/.editor-cache"), "{}", (err) => {
                if(err) throw err;
            });
            return {};
        }
    }
    openWith(cache, file_path) {
        return cache[getFileId(file_path)];
    }
}