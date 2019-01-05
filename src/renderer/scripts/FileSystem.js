import fs from "fs";
import mkdirp from "mkdirp";
import dirToJson from "dir-to-json";
import { base_path, mojang_path } from "./constants.js";
import Store from "../store/index";
import Vue from "../main";

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
                    Store.commit("addToTabSystem", {
                        content,
                        file: path.split("/").pop(),
                        path
                    });
                }
            });
        });
    }

    getPath(path) {
        return base_path + path;
    }
}

export default new FileSystem(); 