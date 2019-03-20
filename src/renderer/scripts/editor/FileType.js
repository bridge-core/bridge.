import TabSystem from "../TabSystem";
import Provider from "./autoCompletions";
let FILE_DEFS;

export default class FileType {
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
}