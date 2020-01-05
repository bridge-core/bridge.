import fs from "fs";
import mkdirp from "mkdirp";
import Store from "../store/index";
import Vue from "../main";
import TabSystem from "./TabSystem";
import { ipcRenderer } from "electron";
import JSONTree from "./editor/JsonTree";
import ProblemIterator from "./editor/problems/Problems";
import LoadingWindow from "../windows/LoadingWindow";
import PluginEnv from "./plugins/PluginEnv";
import path from "path";
import OmegaCache from "./editor/OmegaCache";
import ConfirmWindow from "./commonWindows/Confirm";
import InformationWindow from "./commonWindows/Information";
import { readJSON } from "./Utilities/JsonFS";

document.addEventListener("dragover", event => {
    event.preventDefault();
});
document.addEventListener("drop", event => {
    event.preventDefault();
    
    let win: LoadingWindow;
    let files = Array.from(event.dataTransfer.files);
    if(files.length !== 0) win = new LoadingWindow("save-file").show();

    setTimeout(() => {
        for(let file of files) {
            FileSystem.open(file.path, () => win.close());
        }        
    }, 100);
});
ipcRenderer.on("openFile", (event, path) => {
    FileSystem.open(path);
});

export default class FileSystem {
    static get Cache() {
        throw new Error("Calling FileSystem.Cache is deprecated!");
    }
    static save(file_path: string, content: string | Buffer, update=false, open=false) {
        let dir_path = path.dirname(file_path);
        fs.exists(dir_path, (exists) => {
            if(!exists) mkdirp.sync(dir_path);

            fs.writeFile(file_path, content, (err) => {
                if(err) console.log(err);

                if(update) {
                    Vue.$root.$emit("refreshExplorer");
                }
                if(open) {
                    this.addAsTab(file_path, content, undefined, content);
                }
            });
        });
    }
    static basicSave(path: string, content: string | Buffer, update=false, open=true) {
        if(path === undefined) new InformationWindow("ERROR", "bridge. cannot save this tab's content!");
        fs.writeFile(path, content, err => {
            if(err) throw err;
            if(update) {
                Vue.$root.$emit("refreshExplorer");
            }
            if(open) {
                this.addAsTab(path, content, 0, content);
            }
            PluginEnv.trigger("bridge:finishedSaving", path, true, false);
        });
    }
    static basicSaveAs(path: string, content: string, update=false, open=true) {
        ipcRenderer.send("saveAsFileDialog", { path, content });
    }

    static async open(file_path: string, cb?: () => any) {
        if(typeof file_path !== "string") return;
        if(!fs.statSync(file_path).isFile()) return this.loadDir(file_path);
        let file: Buffer;
        try { file = await this.readFile(file_path); } catch(e) { return; }
        let cache; 
        try { cache = await OmegaCache.load(file_path); } catch(e) { return this.loadFromDisk(file_path, file, cb); }
        

        if(OmegaCache.isCacheFresh(file_path, cache, file.toString())) {
            let { cache_content, format_version, file_version, file_uuid } = cache;
            this.addAsTab(file_path, cache_content, format_version, null, file_version, file_uuid);
            if(typeof cb === "function") cb();
        } else {
            new ConfirmWindow(() => {
                OmegaCache.load(file_path)
                    .then(({ cache_content, format_version, file_version, file_uuid }) => {
                        this.addAsTab(file_path, cache_content, format_version, null, file_version, file_uuid);
    
                        if(typeof cb === "function") cb();
                    })
                    .catch(err => {
                        this.loadFromDisk(file_path, file, cb);
                    })
            }, () => {
                this.loadFromDisk(file_path, file, cb);
            }, `It looks like the file "${path.basename(file_path)}" was edited with a different editor. Do you want to open it from bridge.'s cache or from disk?`, {
                confirm_text: "Cache",
                cancel_text: "Disk"
            });
        }
    }

    static loadFromDisk(file_path: string, file: string | Buffer, cb: () => any) {
        let file_str = file.toString();
        this.addAsTab(file_path, file_str, 0, file, OmegaCache.extractFileVersion(file_path, file_str));
        if(typeof cb === "function") cb();
    }
    static loadDir(file_path: string, cb?: () => any) {
        fs.readdir(file_path, (err, files) => {
            if(err) throw err;
            setTimeout(() => {
                files.forEach((file, i, arr) => this.open(file_path + "\\" + file, arr.length - 1 === i ? cb : undefined));
            }, 1);
        });
    }

    static async loadFile(file_path: string) {
        let loaded;
        try {
            loaded = await OmegaCache.load(file_path);
        } catch(e) { 
            try {
                loaded = { format_version: 0, cache_content: await readJSON(file_path), file_version: 0 };
            } catch(e) {
                loaded = { format_version: 0, cache_content: {}, file_version: 0 };
            }
        }

        let { format_version, cache_content } = loaded;
        if(format_version === 1) {
           return JSONTree.buildFromCache(cache_content).toJSON();
        } else {    
            return cache_content;
        }
    }

    static addAsTab(file_path: string, data: any, format_version=0, raw_data?: string | Buffer, file_version?: number, file_uuid?: string) {
        let tree;
        if(format_version === 1) {
            tree = JSONTree.buildFromCache(data);
            ProblemIterator.findProblems(tree, file_path);
        }

        TabSystem.add({
            file_version,
            file_uuid,

            content: format_version === 1 ? tree : data,
            raw_content: raw_data,
            file_path,
            is_compiled: format_version === 1,
            category: Store.state.Explorer.project.explorer,
            file_name: file_path.split(/\/|\\/).pop()
        });
    }

    static async readFile(file_path: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            fs.readFile(file_path, (err, data) => {
                if(err) reject(err);
                else resolve(data);
            })
        })
    }
}