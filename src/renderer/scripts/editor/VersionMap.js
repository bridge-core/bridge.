//@ts-check
import fs from "fs";
import path from "path";
//@ts-ignore
const MAP = JSON.parse(fs.readFileSync(path.join(__static, "auto_completions/version_map.json")).toString());

export default class VersionMap {
    /**
     * @param {String} state_id 
     * @param {String} version 
     */
    static convert(state_id, version) {
        if(MAP[state_id] === undefined || MAP[state_id][version] === undefined) return state_id;
        return MAP[state_id][version];
    }
}
