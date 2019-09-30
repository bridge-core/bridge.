import detachObj, { detachMerge, maskChannelMerge, maskMerge } from "../mergeUtils";
import OmegaCache from "./OmegaCache";
import { readJSON, writeJSON } from "../utilities/JsonFS";
import path from "path";
import { CURRENT } from "../constants";
import { BridgeCore } from "../bridgeCore/main";
import JSONTree from "./JsonTree";

export class JSONMask {
    constructor(data={}) {
        this.data = data;
    }

    set(channel, mask_data, merge_arrays=[], merge_all=false) {
        if(this.data[channel] === undefined) return this.data[channel] = mask_data;
        if(merge_all) return this.data[channel] = detachMerge(this.data[channel], mask_data);
        if(merge_arrays.length === 0) return this.data[channel] = detachObj(this.data[channel], mask_data);
        return this.data[channel] = maskChannelMerge(this.data[channel], mask_data, merge_arrays);
    }
    reset(channel) {
        if(!channel) this.data = {};
        else this.data[channel] = undefined;
    }

    all() {
        let all = [];

        for(let c in this.data) {
            if(this.data[c] !== undefined) all.push(this.data[c]);
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

    static async delete(file_path) {
        if(this.data === undefined) this.data = await this.loadMasks();
        let key = OmegaCache.toCachePath(file_path, false);
        if(this.data[key] === undefined) return;
        delete this.data[key];

        await this.saveMasks();
    }
    static async rename(old_path, new_path) {
        if(this.data === undefined) this.data = await this.loadMasks();
        let key = OmegaCache.toCachePath(old_path, false);
        if(this.data[key] === undefined) return;

        this.data[OmegaCache.toCachePath(new_path, false)] = this.data[key];
        delete this.data[key];

        await this.saveMasks();
    }
    static async duplicate(what, as) {
        if(this.data === undefined) this.data = await this.loadMasks();
        let key = OmegaCache.toCachePath(what, false);
        if(this.data[key] === undefined) return;
        console.log("HERE", this.data,OmegaCache.toCachePath(as, false), key);

        this.data[OmegaCache.toCachePath(as, false)] = this.data[key];

        await this.saveMasks();
    }

    static async apply(file_path, depth=100) {
        let data;
        let loaded;
        try {
            loaded = await OmegaCache.load(file_path);
        } catch(e) { 
            try {
                loaded = { format_version: 0, cache_content: await readJSON(file_path), file_version: 0 };
            } catch(e) {
                loaded = { format_version: 0, cache_content: {}, file_version: 0 };
            }
        }

        let { format_version, cache_content, file_version } = loaded;
        if(format_version === 1) {
            data = JSONTree.buildFromCache(cache_content).toJSON();
        } else {    
            data = cache_content;
        }
        data = await BridgeCore.beforeSave(data, file_path, depth);

        return writeJSON(file_path, data, true, file_version);
    }
    static async applyOnData(file_path, data, overwrite_arrays=[]) {
        return maskMerge([data, ...(await this.get(file_path)).all()], overwrite_arrays);
    }

    static async generateFromMask(file_path, overwrite_arrays) {
        return writeJSON(
            file_path,
            maskMerge(
                (await this.get(file_path)).all(),
                overwrite_arrays
            ),
            true
        );
    }
}