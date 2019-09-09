import fs from "fs";
import cJSON from "comment-json";

export function readJSON(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if(err) return reject(err);
            try {
                resolve(cJSON.parse(data, undefined, true));
            } catch(e) {
                reject(e);
            }
        });
    });
}
export function writeJSON(path, data, beautify=false) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, JSON.stringify(data, null, beautify ? "\t" : undefined), (err) => {
            if(err) reject(err);
            else resolve();
        });
    });
}

export function readJSONSync(path) {
    return cJSON.parse(fs.readFileSync(path).toString("utf-8"), undefined, true);
}
export function writeJSONSync(path, data, beautify=false) {
    fs.writeFileSync(path, JSON.stringify(data, null, beautify ? "\t" : undefined));
}