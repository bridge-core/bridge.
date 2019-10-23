import fs from "fs";
import cJSON from "comment-json";
import FileType from "../editor/FileType";

export function readJSON(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if(err) return reject(err);
            try {
                resolve(cJSON.parse(data.toString("utf-8"), undefined, true));
            } catch(e) {
                reject(e);
            }
        });
    });
}
export function writeJSON(path: string, data: any, beautify=false, file_version: number) {
    let to_save: any;
    if(file_version === undefined) {
        to_save = JSON.stringify(data, null, beautify ? "\t" : undefined);
    } else {
        to_save = `${FileType.getCommentChar(path)}bridge-file-version: #${file_version}\n${JSON.stringify(data, null, beautify ? "\t" : undefined)}`;
    }
    
    return new Promise((resolve, reject) => {
        fs.writeFile(path, to_save, (err) => {
            if(err) reject(err);
            else resolve();
        });
    });
}

export function readJSONSync(path: string) {
    return cJSON.parse(fs.readFileSync(path).toString("utf-8"), undefined, true);
}
export function writeJSONSync(path: string, data: any, beautify=false) {
    fs.writeFileSync(path, JSON.stringify(data, null, beautify ? "\t" : undefined));
}