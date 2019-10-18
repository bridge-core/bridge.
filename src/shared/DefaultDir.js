/**
 * Allows users to set a different default location for the com.mojang directory
 */
import fs from "fs";
import path from "path";

let DATA_PATH;
if (process.platform == "win32")
    DATA_PATH = path.join(process.env.HOMEDRIVE, process.env.HOMEPATH, ".bridge/data");
else
    DATA_PATH = path.join(process.env.HOME, "bridge/data");

export { DATA_PATH };
export class DefaultDir {
    static set(dir_path) {
        fs.writeFileSync(path.join(DATA_PATH, "default_dir"), dir_path);
    }
    static get() {
        try {
            return fs.readFileSync(path.join(DATA_PATH, "default_dir")).toString();
        } catch(e) {
            return "";
        }
    }
}
