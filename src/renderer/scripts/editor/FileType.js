import TabSystem from "../TabSystem";
import Provider from "../autoCompletions/Provider";
let FILE_DEFS;

export default class FileType {
    static reset() {
        FILE_DEFS = undefined;
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
        return FILE_DEFS.map(file => file.file_creator).filter(file_creator => file_creator !== undefined);
    }

    static getHighlighter() {
        try {
            return this.getData().highlighter;
        } catch(e) {
            return {
                define: {
                    keywords: [],
                    symbols: [],
                    titles: []
                }
            }
        }
    }
}