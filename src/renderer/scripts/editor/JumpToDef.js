import { readJSON } from "../utilities/JsonFS";
import LightningCache from "./LightningCache";
import fs from "fs";
import { CURRENT } from "../constants";
import path from "path";

export default class JumpToDefinition {
    static data = undefined;
    static cache = { definitions: [], fetch_data: undefined, fetch_all: true, result: undefined };
    static async loadData() {
        this.data = await readJSON(path.join(__static, "data/definitions.json"));
    }
    static loadDataSync() {
        this.data = JSON.parse(fs.readFileSync(path.join(__static, "data/definitions.json")).toString("utf-8"));
    }

    static setCache(c) {
        this.cache = c;
    }
    static cacheValid(definitions, fetch_data, fetch_all) {
        if(this.cache.fetch_data !== fetch_data) return false;
        if(this.cache.definitions.length !== definitions.length) return false;

        for(let i = 0; i < definitions.length; i++) {
            if(!this.cache.definitions.includes(definitions[i])) return false;
        }

        if(!this.cache.fetch_all && fetch_all) return false;
        if(this.cache.fetch_all && !fetch_all) return true;
    }
    static useCache(fetch_all) {
        if(this.cache.fetch_all && !fetch_all) return this.cache.result[0];
        return this.cache.result;
    }

    static async fetch(definitions, fetch_data, fetch_all=true) {
        if(this.cacheValid(definitions, fetch_data, fetch_all)) return this.useCache(fetch_all);

        const open = (await Promise.all(definitions.map(d => this.fetchSingle(d, fetch_data, fetch_all)))).flat();
        this.setCache({ definitions, fetch_data, fetch_all, result: open });

        return open;
    }

    static async fetchSingle(definition, fetch_data, fetch_all) {
        if(this.data === undefined) await this.loadData();

        let c = await LightningCache.load();
        let res = [];

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
                        } else if(file.startsWith("RP")) {
                            file_path = path.join(CURRENT.RP_PATH, file.replace("RP", ""));
                        } else {
                            console.error("Unexpected cache file start: " + file);
                        }
                    } catch(e) { /*CACHE WAS PREVIOUSLY BROKEN - PREVENTS ERROR WITH PATH COMPOSITION*/ }
                    
                    if(!fetch_all) return [ file_path ];
                    else res.push(file_path);
                }
            }
        }

        return res;
    }

    static fetchSync(definitions, fetch_data, fetch_all=true) {
        if(this.cacheValid(definitions, fetch_data, fetch_all)) return this.useCache(fetch_all);

        const open = definitions.map(d => this.fetchSingleSync(d, fetch_data, fetch_all)).flat();
        this.setCache({ definitions, fetch_data, fetch_all, result: open });
        
        return open;
    }

    static fetchSingleSync(definition, fetch_data, fetch_all) {
        if(this.data === undefined) this.loadDataSync();

        let c = LightningCache.loadSync();
        let res = [];

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
                    
                    if(!fetch_all) return [ file_path ];
                    else res.push(file_path);
                }
            }
        }

        return res;
    }
}