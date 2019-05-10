import TabSystem from "../TabSystem";
import fs from "fs";
import { RP_BASE_PATH, BASE_PATH } from "../constants";

let last_selected;
let last_result;
export default async function findRP() {
    let selected = TabSystem.project;
    if(selected === last_selected) return last_result;
    last_selected = selected;
    
    let manifest;
    let uuid;
    try {
        manifest = JSON.parse(await readFile(`${BASE_PATH}${selected}\\manifest.json`));
        uuid = manifest.dependencies[0].uuid;
    } catch(e) {
        last_result = "/@NO-DEPENDENCY@/";
        return "/@NO-DEPENDENCY@/";
    }

    let rps = await readDirectory(RP_BASE_PATH);
    let promises = [];
    rps.forEach(rp => promises.push(readFile(`${RP_BASE_PATH}${rp}\\manifest.json`)));
    promises = await Promise.all(promises).then(data => data.map(e => JSON.parse(e)));
    
    for(let i = 0; i < promises.length; i++) {
        if(promises[i].header.uuid === uuid) {
            last_result = rps[i];
            return rps[i];
        }
            
    }

    last_result = "/@NO-RP@/";
    return "/@NO-RP@/";
}

function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, "utf8", (err, data) => {
            if(err) reject(err);
            resolve(data);
        });
    });
}
function readDirectory(path) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, data) => {
            if(err) reject(err);
            resolve(data);
        });
    });
}