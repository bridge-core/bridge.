/**
 * Utility for finding files based on definitions inside of them
 */
import LightningCache from "./LightningCache";
import { CURRENT } from "../constants";
import path from "path";

export default class FetchDefinitions {
    /**
     * @param {*} fetch_defs Object containing arrays of definitions to fetch per file_type (<- key)
     * | e.g. { entity: [ "identifiers", "families" ], item: [ "identifiers" ] }
     */
    static async fetch(file_types, fetch_defs={}, fetch_search, fetch_all=true) {
        return (await Promise.all(file_types.map(t => this.fetchSingle(t, fetch_defs[t], fetch_search, fetch_all))).catch(console.error)).flat();
    }

    static async fetchSingle(file_type, fetch_defs=[], fetch_search, fetch_all) {
        let c = await LightningCache.load();
        let res = [];

        if(c[file_type] === undefined) return;
        //FOREACH FETCH_DEF
        for (let d of fetch_defs) {
            //GO THROUGH ALL FILES
            for(let file in c[file_type]) {
                //LOOKUP CACHE KEY
                if(c[file_type][file][d] && c[file_type][file][d].includes(fetch_search)) {
                    let file_path;
                    try {
                        //LOAD FILE PATH
                        if(file.startsWith("BP")) {
                            file_path = path.join(CURRENT.PROJECT_PATH, file.replace("BP", ""));
                        } else if(file.startsWith("RP")) {
                            file_path = path.join(CURRENT.RP_PATH, file.replace("RP", ""));
                        } else {
                            console.error("Unexpected cache file start: " + file);
                        }
                    } catch(e) { /*CACHE WAS PREVIOUSLY BROKEN - PREVENTS ERROR WITH PATH COMPOSITION*/ }
                    
                    if(file_path === undefined) continue;
                    if(!fetch_all) return [ file_path ];
                    else res.push(file_path);
                }
            }
        }

        return res;
    }

    static fetchSync(file_types, fetch_defs={}, fetch_search, fetch_all=true) {
        return file_types.map(d => this.fetchSingleSync(d, fetch_defs[d], fetch_search, fetch_all)).flat();
    }

    static fetchSingleSync(file_type, fetch_defs=[], fetch_search, fetch_all) {
        let c = LightningCache.loadSync();
        let res = [];

        if(c[file_type] === undefined) return;
        //FOREACH FETCH_DEF
        for (let d of fetch_defs) {
            //GO THROUGH ALL FILES
            for(let file in c[file_type]) {
                //LOOKUP CACHE KEY
                if(c[file_type][file][d] && c[file_type][file][d].includes(fetch_search)) {
                    let file_path;
                    try {
                        //LOAD FILE PATH
                        if(file.startsWith("BP")) {
                            file_path = path.join(CURRENT.PROJECT_PATH, file.replace("BP", ""));
                        } else if(file.startsWith("RP")) {
                            file_path = path.join(CURRENT.RP_PATH, file.replace("RP", ""));
                        } else {
                            console.error("Unexpected cache file start: " + file);
                        }
                    } catch(e) { /*CACHE WAS PREVIOUSLY BROKEN - PREVENTS ERROR WITH PATH COMPOSITION*/ }
                    
                    if(file_path === undefined) continue;
                    if(!fetch_all) return [ file_path ];
                    else res.push(file_path);
                }
            }
        }

        return res;
    }
}