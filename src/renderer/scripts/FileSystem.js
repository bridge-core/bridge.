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

document.addEventListener("dragover", event => {
    event.preventDefault();
});
document.addEventListener("drop", event => {
    let win;
    event.preventDefault();
    let files = event.dataTransfer.files;
    if(files.length !== 0) win = new LoadingWindow("save-file").show();

    setTimeout(() => {
        for(let file of files) {
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
        });
    }
    basicSaveAs(path, content) {
        ipcRenderer.send("saveAsFileDialog", { path, content });
    }

    open(path, cb) {
        if(typeof path !== "string") return;
        
        this.Cache.get(path)
            .then((cache) => 
                cache.content ? 
                    this.addAsTab(path, cache.content, cache.format_version) : 
                    fs.readFile(path, (err, data) => {
                        if(err) throw err;
                        this.addAsTab(path, data.toString(), 0, data);

                        if(typeof cb === "function") cb();
                    })
            )
            .catch((err) => {
                console.log("[OPEN] Not opened from cache");
                if(fs.statSync(path).isFile()) {
                    fs.readFile(path, (err, data) => {
                        if(err) throw err;
                        this.addAsTab(path, data.toString(), 0, data);

                        if(typeof cb === "function") cb();
                    });
                } else {
                    fs.readdir(path, (err, files) => {
                        if(err) throw err;
                        setTimeout(() => {
                            files.forEach((file, i, arr) => this.open(path + "\\" + file, arr.length - 1 === i ? cb : undefined));
                        }, 1);
                    });
                }
            });
    }
    addAsTab(path, data, format_version=0, raw_data) {
        let tree;
        if(format_version === 1) {
            tree = JSONTree.buildFromCache(data);
            ProblemIterator.findProblems(tree, path);
        }

        TabSystem.add({ 
            content: format_version === 1 ? tree : data,
            raw_content: raw_data,
            file_path: path,
            is_compiled: format_version === 1,
            category: Store.state.Explorer.project.explorer,
            file_name: path.split(/\/|\\/).pop()
        });
    }
}

const FILE_SYSTEM = new FileSystem();
export default FILE_SYSTEM;