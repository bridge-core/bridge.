import fs from "fs";
import mkdirp from "mkdirp";
import { BASE_PATH } from "./constants.js";
import Store from "../store/index";
import Vue from "../main";
import TabSystem from "./TabSystem";
import { ipcRenderer } from "electron";
import Cache from "./utilities/Cache.js";
import JSONTree from "./editor/JsonTree.js";
import ProblemIterator from "./editor/problems/Problems.js";

function getPath(path) {
    return BASE_PATH + path;
}

class FileSystem {
    constructor() {
        this.Cache = new Cache();
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
                    this.addAsTab(getPath(path), content, content);
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
            .then((cache) => 
                cache.content ? 
                    this.addAsTab(path, cache.content, cache.format_version) : 
                    fs.readFile(path, (err, data) => {
                        if(err) throw err;
                        this.addAsTab(path, data.toString(), 0, data);
                    })
            )
            .catch((err) => {
                console.log("[OPEN] Not opened from cache", err);
                fs.readFile(path, (err, data) => {
                    if(err) throw err;
                    this.addAsTab(path, data.toString(), 0, data);
                });
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