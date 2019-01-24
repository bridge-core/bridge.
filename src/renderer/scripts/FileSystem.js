import fs from "fs";
import mkdirp from "mkdirp";
import dirToJson from "dir-to-json";
import { BASE_PATH } from "./constants.js";
import Store from "../store/index";
import Vue from "../main";
import TabSystem from "./TabSystem";
import { ipcRenderer } from "electron";

ipcRenderer.on("openFile", (event, path) => {
    new FileSystem().open(path);
});

class FileSystem {
    save(path, content, update=false, open=false) {
        let tmp_path = this.getPath(path).split("/");
        tmp_path.pop();
        tmp_path = tmp_path.join("/");
        fs.exists(tmp_path, (exists) => {
            if(!exists) mkdirp.sync(tmp_path);

            fs.writeFile(this.getPath(path), content, (err) => {
                if(err) console.log(err);

                if(update) {
                    Vue.$root.$emit("refreshExplorer");
                }
                if(open) {
                    TabSystem.add({ 
                        content,
                        raw_content: content,
                        file_path: this.getPath(path),
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
        fs.readFile(path, (err, data) => {
            if(err) throw err;

            TabSystem.add({ 
                content: data.toString(),
                raw_content: data,
                file_path: path,
                category: Store.state.Explorer.project,
                file_name: path.split(/\/|\\/).pop()
            });
        });
    }

    getPath(path) {
        return BASE_PATH + path;
    }
}

export default new FileSystem();