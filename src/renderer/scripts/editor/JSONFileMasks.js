import { detachMerge } from "../detachObj";
import OmegaCache from "./OmegaCache";
import { readJSON, writeJSON } from "../utilities/JsonFS";
import path from "path";
import { CURRENT } from "../constants";

export class JSONMask {
    constructor(data={}) {
        this.data = data;
    }

    set(channel, mask_data) {
        if(this.data[channel] === undefined) return this.data[channel] = mask_data;
        return this.data[channel] = detachMerge(this.data[channel], mask_data);
    }
    reset(channel) {
        if(!channel) this.data = {};
        else this.data[channel] = {};
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

    static async getMask(file_path) {
        if(this.data === undefined) this.data = await this.loadMasks();
        let key = OmegaCache.toCachePath(file_path);
        if(this.data[key] === undefined) this.data[key] = new JSONMask();
        return this.data[key];
    }

    static async get(file_path) {
        if(this.data === undefined) this.data = await this.loadMasks();
        return this.data[OmegaCache.toCachePath(file_path)].all();
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
            res[mask_paths] = new JSONMask(masks[mask_paths]);
        }
        console.log(res);
        return res;
    }
}