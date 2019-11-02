/**
 * Wrapper around FetchDefinitions.js to allow efficient usage inside the JSON context menu (HoverCard.vue) 
 * for the "Jump To Definition" action
 */
import { readJSON } from "../utilities/JsonFS";
import fs from "fs";
import path from "path";
import FetchDefinitions from "./FetchDefinitions";

export default class JumpToDefinition {
    static data = undefined;
    static cache = { file_types: [], fetch_search: undefined, fetch_all: true, result: undefined };
    static async loadData() {
        this.data = await readJSON(path.join(__static, "data/definitions.json"));
    }
    static loadDataSync() {
        this.data = JSON.parse(fs.readFileSync(path.join(__static, "data/definitions.json")).toString("utf-8"));
    }

    static setCache(c) {
        this.cache = c;
    }
    static cacheValid(file_types, fetch_search, fetch_all) {
        if(this.cache.fetch_search !== fetch_search) return false;
        if(this.cache.file_types.length !== file_types.length) return false;

        for(let i = 0; i < file_types.length; i++) {
            if(!this.cache.file_types.includes(file_types[i])) return false;
        }

        if(!this.cache.fetch_all && fetch_all) return false;
        if(this.cache.fetch_all && !fetch_all) return true;
    }
    static useCache(fetch_all) {
        if(this.cache.fetch_all && !fetch_all) return this.cache.result[0];
        return this.cache.result;
    }

    static async fetch(file_types, fetch_search, fetch_all=true) {
        if(this.cacheValid(file_types, fetch_search, fetch_all)) return this.useCache(fetch_all);
        if(this.data === undefined) await this.loadData();

        const open = await FetchDefinitions.fetch(file_types, this.data, fetch_search, fetch_all);
        this.setCache({ file_types, fetch_search, fetch_all, result: open });

        return open;
    }

    static async fetchSingle(file_type, fetch_search, fetch_all) {
        return await FetchDefinitions.fetchSingle(file_type, this.data[file_type], fetch_search, fetch_all);
    }

    static fetchSync(file_types, fetch_search, fetch_all=true) {
        if(this.cacheValid(file_types, fetch_search, fetch_all)) return this.useCache(fetch_all);
        if(this.data === undefined)  this.loadDataSync();

        const open = FetchDefinitions.fetchSync(file_types, this.data, fetch_search, fetch_all);
        this.setCache({ file_types, fetch_search, fetch_all, result: open });

        return open;
    }

    static fetchSingleSync(file_type, fetch_search, fetch_all) {
        return FetchDefinitions.fetchSingleSync(file_type, this.data[file_type], fetch_search, fetch_all);
    }
}