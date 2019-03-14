import TabSystem from "../TabSystem";
import Provider from "./autoCompletions";
let FILE_DEFS;

export default class FileType {
    static get() {
        if(FILE_DEFS === undefined) FILE_DEFS = Provider.FILE_DEFS;
        let path;
        
        try {
            path = TabSystem.getSelected().file_path;
        } catch(e) { return "unknown"; }
        
        for(let def of FILE_DEFS) {
            if(path.includes(def.includes)) return def.id;
        }
        return "unknown";
    }

    static getAll() {
        if(FILE_DEFS === undefined) FILE_DEFS = Provider.FILE_DEFS;
        return FILE_DEFS.map(def => def.id);
    }
}