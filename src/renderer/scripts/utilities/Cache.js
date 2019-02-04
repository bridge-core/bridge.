import fs from "fs";
import mkdirp from "mkdirp";
import { BASE_PATH } from "../constants.js";
import Store from "../../store/index";

function getPath(path) {
    return BASE_PATH + path;
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

    save(file_path, file_content, other={}) {
        this.getCache((cache) => {
            if(file_content != undefined) {
                cache[getFileId(file_path)] = Object.assign(cache[getFileId(file_path)] || {}, {
                    content: file_content
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
                })
                .catch(err => reject(err));
        });
        
    }
    removeAllDependencies(sources, dependency) {
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
        fs.writeFile(getPath(this.project + "/bridge/.editor-cache"), JSON.stringify(data, null, "\t"), (err) => {
            if(err) throw err;
        });
    }
    getCache(cb) {
        if(this.cached_cache != undefined && this.loaded_cache == this.project) {
            cb(this.cached_cache);
            return;
        }
        let p = getPath(this.project + "/bridge").replace(/\//g, "\\");

        fs.exists(getPath(p), (exists) => {
            if(!exists) mkdirp.sync(p);

            fs.exists(p + "/.editor-cache", (exists_file) => {
                if(!exists_file) {
                    fs.writeFile(p + "/.editor-cache", "{}", (err) => {
                        if(err) throw err;
                        this.cached_cache = {};
                        this.loaded_cache = this.project;
                        
                        if(typeof cb == "function") cb({});
                    });
                } else {
                    fs.readFile(p + "/.editor-cache", (err, data) => {
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
    getCacheSync() {
        let p = getPath(this.project + "/bridge").replace(/\//g, "\\");

        if(!fs.existsSync(getPath(p))) mkdirp.sync(p);
        if(!fs.existsSync(getPath(p + "/.editor-cache"))) {
            fs.writeFile(p + "/.editor-cache", "{}", (err) => {
                if(err) throw err;
            });
            return {};
        } else {
            return JSON.parse(fs.readFileSync(p + "/.editor-cache"));
        }
    }
    openWith(cache, file_path) {
        return cache[getFileId(file_path)];
    }
}