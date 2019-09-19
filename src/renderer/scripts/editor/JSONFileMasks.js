import detachObj, { detachMerge } from "../detachObj";
import OmegaCache from "./OmegaCache";
import { readJSON, writeJSON } from "../utilities/JsonFS";
import path from "path";
import { CURRENT } from "../constants";

export class JSONMask {
    constructor(data={}) {
        this.data = data;
    }

    set(channel, mask_data, overwrite_arrays=true) {
        if(this.data[channel] === undefined) return this.data[channel] = mask_data;
        if(overwrite_arrays) return this.data[channel] = detachObj(this.data[channel], mask_data);
        return this.data[channel] = detachMerge(this.data[channel], mask_data);
    }
    reset(channel) {
        if(!channel) this.data = {};
        else this.data[channel] = undefined;
    }

    all() {
        let all = [];

        for(let c in this.data) {
            all.push(this.data[c]);
        }

        return all;
    }
}

export class JSONFileMasks {
    static data = undefined;

    static async get(file_path) {
        if(this.data === undefined) this.data = await this.loadMasks();
        let key = OmegaCache.toCachePath(file_path, false);
        if(this.data[key] === undefined) this.data[key] = new JSONMask();
        return this.data[key];
    }

    static resetMasks() {
        this.data = undefined;
    }
    static async saveMasks() {
        await writeJSON(path.join(CURRENT.PROJECT_PATH, "bridge/.file_masks"), this.data, true);
    }
    static async loadMasks() {
        let masks;
        try {
            masks = await readJSON(path.join(CURRENT.PROJECT_PATH, "bridge/.file_masks"))
        } catch(e) { return {}; }

        let res = {};
        for(let mask_paths in masks) {
            res[mask_paths] = new JSONMask(masks[mask_paths].data);
        }
        return res;
    }

    static async apply(file_path, data, write_json=true) {
        if(data === undefined) {
            try {
                data = await readJSON(file_path);
            } catch(e) { return; }
        }
        data = detachMerge(data, ...(await this.get(file_path)).all());

        if(write_json) return writeJSON(file_path, data, true, await OmegaCache.loadFileVersion(file_path));
        else return data;
    }
}