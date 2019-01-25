import fs from "fs";
import mkdirp from "mkdirp";
import dirToJson from "dir-to-json";
import { BASE_PATH } from "./constants.js";
import Store from "../store/index";
import Vue from "../main";
import TabSystem from "./TabSystem";
import { ipcRenderer } from "electron";

function getPath(path) {
    return BASE_PATH + path;
}
function getFileId(file_path) {
    return file_path.replace(BASE_PATH, "").replace(/\\/g, "/");
}

class FileSystem {
    constructor() {
        this.Cache = {
            cached_cache: undefined,
            loaded_cache: undefined,
            get project() {
                return Store.state.Explorer.project;
            },
            save(file_path, file_content) {
                this.getCache((cache) => {
                    console.log(cache);
                    cache[getFileId(file_path)] = {
                        content: file_content
                    };
                    this.saveCache(cache);
                    
                    //this.cached_cache = cache;
                    this.loaded_cache = this.project;
                });
            },
            get(file_path) {
                return new Promise((resolve, reject) => {
                    this.getCache((cache) => {
                        let id = getFileId(file_path);
                        if(cache[id] == undefined) return reject(`File ${id} is not cached yet.`);
                        resolve(cache[id]);
                    });
                });
            },
            saveCache(data) {
                fs.writeFile(getPath(this.project + "/bridge/.editor-cache"), JSON.stringify(data, null, "\t"), (err) => {
                    if(err) throw err;
                });
            },
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
                                let c = JSON.parse(data);
                                this.cached_cache = c;
                                this.loaded_cache = this.project;
        
                                if(typeof cb == "function") cb(c);
                            });
                        }
                    });
                });
            }
        }
    }
    save(path, content, update=false, open=false) {
        let tmp_path = getPath(path).split("/");
        tmp_path.pop();
        tmp_path = tmp_path.join("/");
        fs.exists(tmp_path, (exists) => {
            if(!exists) mkdirp.sync(tmp_path);

            fs.writeFile(getPath(path), content, (err) => {
                if(err) console.log(err);

                if(update) {
                    Vue.$root.$emit("refreshExplorer");
                }
                if(open) {
                    TabSystem.add({ 
                        content,
                        raw_content: content,
                        file_path: getPath(path),
                        category: Store.state.Explorer.project,
                        file_name: path.split(/\/|\\/).pop()
                    });
                }
            });
        });
    }
    basicSave(path, content, update=false) {
        fs.writeFile(path, content, err => {
            if(err) throw err;
            if(update) {
                Vue.$root.$emit("refreshExplorer");
            }
        });
    }
    basicSaveAs(path, content) {
        ipcRenderer.send("saveAsFileDialog", { path, content });
    }

    open(path) {
        this.Cache.get(path)
            .then((cache) => this.addAsTab(path, cache.content))
            .catch(() => {
                fs.readFile(path, (err, data) => {
                    if(err) throw err;
                    this.addAsTab(path, data.toString(), data);
                });
            });
    }
    addAsTab(path, data, raw_data) {
        TabSystem.add({ 
            content: data,
            raw_content: raw_data,
            file_path: path,
            category: Store.state.Explorer.project,
            file_name: path.split(/\/|\\/).pop()
        });
    }
}

const FILE_SYSTEM = new FileSystem();
ipcRenderer.on("openFile", (event, path) => {
    FILE_SYSTEM.open(path);
});

export default FILE_SYSTEM;