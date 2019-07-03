import fs from "fs";
import mkdirp from "mkdirp";
import Store from "../store/index";
import Vue from "../main";
import TabSystem from "./TabSystem";
import { ipcRenderer } from "electron";
import Cache from "./utilities/Cache.js";
import JSONTree from "./editor/JsonTree.js";
import ProblemIterator from "./editor/problems/Problems.js";
import LoadingWindow from "../windows/LoadingWindow";
import PluginEnv from "./plugins/PluginEnv";
import path from "path";
import OmegaCache from "./editor/OmegaCache";
import PluginAssert from "./plugins/PluginAssert";
import { booleanAnyOfTrigger } from "./plugins/EventTriggers";
import FileType from "./editor/FileType";

document.addEventListener("dragover", event => {
    event.preventDefault();
});
document.addEventListener("drop", event => {
    let win;
    event.preventDefault();
    let files = event.dataTransfer.files;
    if(files.length !== 0) win = new LoadingWindow("save-file").show();
    console.log(event.dataTransfer.files)

    setTimeout(() => {
        for(let file of files) {
            console.log(file);
            FILE_SYSTEM.open(file.path, () => win.close());
        }        
    }, 100);
});
ipcRenderer.on("openFile", (event, path) => {
    FILE_SYSTEM.open(path);
});

class FileSystem {
    constructor() {
        this.Cache = new Cache();
    }
    save(path, content, update=false, open=false) {
        let tmp_path = path.split("/");
        tmp_path.pop();
        tmp_path = tmp_path.join("/");
        fs.exists(tmp_path, (exists) => {
            if(!exists) mkdirp.sync(tmp_path);

            fs.writeFile(path, content, (err) => {
                if(err) console.log(err);

                if(update) {
                    Vue.$root.$emit("refreshExplorer");
                }
                if(open) {
                    this.addAsTab(path, content, content);
                }
            });
        });
    }
    basicSave(path, content, update=false, open=true) {
        fs.writeFile(path, content, err => {
            if(err) throw err;
            if(update) {
                Vue.$root.$emit("refreshExplorer");
            }
            if(open) {
                this.addAsTab(path, content, content);
            }
            PluginEnv.trigger("bridge:finishedSaving", path, true, false);
        });
    }
    basicSaveAs(path, content) {
        ipcRenderer.send("saveAsFileDialog", { path, content });
    }

    async open(file_path, cb) {
        if(typeof file_path !== "string") return;
        let ext = path.extname(file_path);

        try {
            if(await OmegaCache.isCacheFresh(file_path)) {
                let { cache_content, format_version } = await OmegaCache.load(file_path);
                this.addAsTab(file_path, cache_content, format_version)
                if(typeof cb === "function") cb();
            } else if(booleanAnyOfTrigger("bridge:confirmCacheUse", { 
                file_path: file_path, 
                file_extension: ext, 
                file_type: FileType.get(file_path)
            })) {
                OmegaCache.load(file_path)
                    .then(({ cache_content, format_version }) => {
                        this.addAsTab(file_path, cache_content, format_version);

                        if(typeof cb === "function") cb();
                    })
                    .catch(err => {
                        console.log("[FS] Not opened from cache. Err:", err);
                        this.loadFromDisk(file_path, cb);
                    }) 
            } else {
                this.loadFromDisk(file_path, cb);
            }
        } catch(e) {
            PluginAssert.throw("bridge:confirmCacheUsage", e);
        }
    }

    loadFromDisk(file_path, cb) {
        if(fs.statSync(file_path).isFile()) {
            fs.readFile(file_path, (err, data) => {
                if(err) throw err;
                this.addAsTab(file_path, data.toString(), 0, data);

                if(typeof cb === "function") cb();
            });
        } else {
            fs.readdir(file_path, (err, files) => {
                if(err) throw err;
                setTimeout(() => {
                    files.forEach((file, i, arr) => this.open(file_path + "\\" + file, arr.length - 1 === i ? cb : undefined));
                }, 1);
            });
        }
    }

    addAsTab(file_path, data, format_version=0, raw_data) {
        console.log(data);
        let tree;
        if(format_version === 1) {
            tree = JSONTree.buildFromCache(data);
            ProblemIterator.findProblems(tree, file_path);
        }

        TabSystem.add({ 
            content: format_version === 1 ? tree : data,
            raw_content: raw_data,
            file_path,
            is_compiled: format_version === 1,
            category: Store.state.Explorer.project.explorer,
            file_name: file_path.split(/\/|\\/).pop()
        });
    }
}

const FILE_SYSTEM = new FileSystem();
export default FILE_SYSTEM;