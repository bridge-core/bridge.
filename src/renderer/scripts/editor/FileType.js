import TabSystem from "../TabSystem";
import Provider from "../autoCompletions/Provider";
import fs from "fs";
let FILE_DEFS;
let HIGHLIGHTER_CACHE = {};
let FILE_CREATOR_CACHE = [];

export default class FileType {
    static reset() {
        FILE_DEFS = undefined;
        FILE_CREATOR_CACHE = [];
    }

    static get(file_path) {
        let data = this.getData(file_path);
        if(data === undefined) return "unknown";
        return data.id;
    }

    static getData(file_path) {
        if(FILE_DEFS === undefined) FILE_DEFS = Provider.FILE_DEFS;
        let path = file_path;
        
        if(path === undefined) {
                try {
                path = TabSystem.getSelected().file_path;
            } catch(e) { return; }
        }
        
        for(let def of FILE_DEFS) {
            if(path.includes(def.includes)) return def;
        }
        return;
    }

    static getAll() {
        if(FILE_DEFS === undefined) FILE_DEFS = Provider.FILE_DEFS;
        return FILE_DEFS.map(def => def.id);
    }

    static getFileCreator() {
        if(FILE_DEFS === undefined) FILE_DEFS = Provider.FILE_DEFS;
        if(FILE_CREATOR_CACHE.length === 0) {
            FILE_CREATOR_CACHE = FILE_DEFS.reduce((acc, file) => {
                if(file.file_creator !== undefined) {
                    if(typeof file.file_creator === "string")
                        acc.push(JSON.parse(fs.readFileSync(`${__static}\\file_creator\\${file.file_creator}.json`).toString()));
                    else
                        acc.push(file.file_creator);
                }
                return acc;
            }, []);
        }
        return FILE_CREATOR_CACHE;
    }

    static getHighlighter() {
        try {
            console.log(this.getData())
            let hl = this.getData().highlighter;
            if(typeof hl !== "string")
                return hl;
            if(HIGHLIGHTER_CACHE[hl] === undefined)
                HIGHLIGHTER_CACHE[hl] = JSON.parse(fs.readFileSync(`${__static}\\highlighter\\${hl}.json`).toString());
            return HIGHLIGHTER_CACHE[hl];
        } catch(e) {
            console.error("Failed to load file highlighter!");
            return {
                define: {
                    keywords: [],
                    symbols: [],
                    titles: []
                }
            };
        }
    }
}