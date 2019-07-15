import fs from "fs";

export function readJSON(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if(err) return reject(err);
            try {
                resolve(JSON.parse(data.toString()));
            } catch(e) {
                reject(e);
            }
        });
    });
}
export function writeJSON(path, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, JSON.stringify(data), (err) => {
            if(err) reject(err);
            else resolve();
        });
    });
}