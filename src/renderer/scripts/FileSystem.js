import fs from "fs";
import mkdirp from "mkdirp";
import dirToJson from "dir-to-json";
import { base_path, mojang_path } from "./constants.js";

class FileSystem {
    save(path, content) {
        let tmp_path = this.getPath(path).split("/");
        tmp_path.pop();
        tmp_path = tmp_path.join("/");
        fs.exists(tmp_path, (exists) => {
            if(!exists) mkdirp.sync(tmp_path);

            fs.writeFile(this.getPath(path), content, (err) => {
                if(err) console.log(err);
            });
        });
    }

    getPath(path) {
        console.log(base_path);
        
        return base_path + path;
    }
}

export default new FileSystem(); 