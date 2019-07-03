import TabSystem from "../TabSystem";
import fs from "fs";
import { RP_BASE_PATH, BASE_PATH } from "../constants";

let last_selected;
let last_result;
export function setRP(val) {
    last_result = val;
}
export default async function findRP() {
    let selected = TabSystem.project;
    if(selected === undefined) return "/@NO-RP@/";
    if(selected === last_selected && last_result !== undefined) return last_result;
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
    promises = await Promise.all(promises).then(data => data.map(e => e !== undefined ? JSON.parse(e) : e));
    
    for(let i = 0; i < promises.length; i++) {
        if(promises[i] !== undefined && promises[i].header.uuid === uuid) {
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
            if(err) {
                console.log("Unable to read file: " + path);
                resolve(undefined);
            } else resolve(data);
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