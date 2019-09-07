import { readJSON } from "../utilities/JsonFS";
import LightningCache from "./LightningCache";
import FileSystem from "../FileSystem";
import { CURRENT } from "../constants";
import path from "path";


export default class JumpToDefinition {
    data = undefined;
    static async loadData() {
        this.data = await readJSON(path.join(__static, "data/definitions.json"));
    }

    static async fetch(definitions, fetch_data, fetch_all=true) {
        definitions.forEach(d => this.fetchSingle(d, fetch_data, fetch_all));
    }

    static async fetchSingle(definition, fetch_data, fetch_all) {
        if(this.data === undefined) await this.loadData();

        let c = await LightningCache.load();

        if(c[definition] === undefined) return;
        //LOAD CACHE KEYS WHICH COUNT AS DEFS
        for (let d of this.data[definition]) {
            //GO THROUGH ALL FILES
            for(let file in c[definition]) {
                //LOOKUP CACHE KEY
                if(c[definition][file][d].includes(fetch_data)) {
                    let file_path;
                    try {
                        if(file.startsWith("BP")) {
                            file_path = path.join(CURRENT.PROJECT_PATH, file.replace("BP", ""));
                        } 
                        else if(file.startsWith("RP")) {
                            file_path = path.join(CURRENT.RP_PATH, file.replace("RP", ""));
                        } 
                        else console.error("Unexpected cache file start: " + file);
                    } catch(e) { /*CACHE WAS PREVIOUSLY BROKEN - PREVENTS ERROR WITH PATH COMPOSITION*/ }
                    
                    if(!fetch_all) return FileSystem.open(file_path);
                    else FileSystem.open(file_path);
                }
            }
        }
    }
}