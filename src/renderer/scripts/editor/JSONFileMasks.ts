/**
 * Multilayer cache system for advanced use cases
 * Enables rich custom syntax applications
 */
import detachObj, { detachMerge, maskChannelMerge, maskMerge, MergeArrayConfig } from "../Utilities/mergeUtils";
import OmegaCache from "./OmegaCache";
import { readJSON, writeJSON } from "../Utilities/JsonFS";
import path from "path";
import { CURRENT } from "../constants";
import { BridgeCore } from "../bridgeCore/main";
import JSONTree from "./JsonTree";
import { promises as fs } from "fs";
import { uuid } from "../Utilities/useAttr";

export class JSONMask {
    protected data: { [channel: string]: any };
    constructor(data={}) {
        this.data = data;
    }

    set(channel: string, mask_data: any, merge_arrays: string[] | MergeArrayConfig=[], merge_all=false) {
        if(this.data[channel] === undefined) return this.data[channel] = mask_data;
        if(merge_all) return this.data[channel] = detachMerge(this.data[channel], mask_data);
        if(merge_arrays.length === 0) return this.data[channel] = detachObj(this.data[channel], mask_data);
        return this.data[channel] = maskChannelMerge(this.data[channel], mask_data, merge_arrays);
    }
    overwrite(channel: string, mask_data: any) {
        this.data[channel] = mask_data;
    }
    reset(channel?: string) {
        if(!channel) this.data = {};
        else this.data[channel] = undefined;
    }

    get(channel: string) {
        return this.data[channel];
    }
    all(filter?: (layer_name: string) => boolean) {
        let all = JSONFileMasks.getShared().all(filter);

        for(let c in this.data) {
            if(this.data[c] !== undefined && (typeof filter !== "function" || filter(c))) all.push(this.data[c]);
        }

        return all;
    }
}

export class SharedJSONMask extends JSONMask {
    all(filter?: (layer_name: string) => boolean) {
        let all = [];

        for(let c in this.data) {
            if(this.data[c] !== undefined && (typeof filter !== "function" || filter(c))) all.push(this.data[c]);
        }

        return all;
    }
}

export class JSONFileMasks {
    private static data: { [f: string]: JSONMask };
    private static shared_data = new SharedJSONMask(); //Data shared between all files; TODO: Allow unique shared data per file type


    static async get(file_path: string) {
        if(this.data === undefined) this.data = await this.loadMasks();
        let key = OmegaCache.toCachePath(file_path, false);
        if(this.data[key] === undefined) this.data[key] = new JSONMask();
        return this.data[key];
    }

    static getShared() {
        return this.shared_data;
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

        let res: { [f: string]: JSONMask } = {};
        for(let mask_paths in masks) {
            res[mask_paths] = new JSONMask(masks[mask_paths].data);
        }
        return res;
    }

    static async delete(file_path: string) {
        if(this.data === undefined) this.data = await this.loadMasks();
        let key = OmegaCache.toCachePath(file_path, false);
        if(this.data[key] === undefined) return;
        delete this.data[key];

        await this.saveMasks();
    }
    static async rename(old_path: string, new_path: string) {
        if(this.data === undefined) this.data = await this.loadMasks();
        let key = OmegaCache.toCachePath(old_path, false);
        if(this.data[key] === undefined) return;

        this.data[OmegaCache.toCachePath(new_path, false)] = this.data[key];
        delete this.data[key];

        await this.saveMasks();
    }
    static async duplicate(what: string, as: string) {
        if(this.data === undefined) this.data = await this.loadMasks();
        let key = OmegaCache.toCachePath(what, false);
        if(this.data[key] === undefined) return;

        this.data[OmegaCache.toCachePath(as, false)] = this.data[key];

        await this.saveMasks();
    }

    static async apply(file_path: string, depth=100) {
        let data;
        let loaded;
        try {
            loaded = await OmegaCache.load(file_path);
        } catch(e) { 
            let cache_content = {}
            try {
                cache_content = await readJSON(file_path);
            } catch(e) {}
            
            OmegaCache.save(file_path, {
                cache_content,
                format_version: 0,
                file_version: 0,
                file_uuid: uuid()
            });
            loaded = { format_version: 0, cache_content, file_version: 0 };
        }

        let { format_version, cache_content, file_version } = loaded;
        if(format_version === 1) {
            data = JSONTree.buildFromCache(cache_content).toJSON();
        } else {    
            data = cache_content;
        }
        data = await BridgeCore.beforeSave(data, file_path, depth, true);

        await fs.mkdir(path.dirname(file_path), { recursive: true });
        return writeJSON(file_path, data, true, file_version);
    }
    static async applyOnData(file_path: string, data: any, filter: (layer_name: string) => boolean, overwrite_arrays?: string[]) {
        return maskMerge([...(await this.get(file_path)).all(filter), data], overwrite_arrays);
    }

    static async generateFromMask(file_path: string, overwrite_arrays?: string[]) {
        await fs.mkdir(path.dirname(file_path), { recursive: true });
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