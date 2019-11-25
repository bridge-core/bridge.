/**
 * Implements powerful custom add-on syntax
 */
import FileType from "../editor/FileType";
import TabSystem from "../TabSystem";
import OmegaCache from "../editor/OmegaCache";
import { JSONFileMasks } from "../editor/JSONFileMasks";
import path from "path";
import CORE_FILES from "./CORE_FILES";

import EntityHandler, { handleTags } from "./EntityHandler";
import ItemHandler from "./ItemHandler";
import TagHandler from "./TagHandler";
import InformationWindow from "../commonWindows/Information";
import ComponentRegistry from "../plugins/CustomComponents";
import MapAreaHandler from "./MapAreaHandler";
import trash from "trash";
import { CURRENT } from "../constants";
import { use } from "../utilities/useAttr";

export interface OnSaveData {
    file_path: string;
    file_name: string;
    file_uuid: string;
    data: any;
    depth: number;
    simulated_call: boolean;
}

export const UI_DATA = {
    name: "bridge. Core",
    author: "bridge. Team",
    description: "A core library which improves your add-on experience with custom syntax.",
    version: "1.0.0",
    id: "bridge.core"
}

export class BridgeCore {
    static is_active = false;
    static save_registry: { [t: string]: (data: OnSaveData) => any } = {};

    static isActive() {
        return this.is_active;
    }
    static activate() {
        this.is_active = true;
    }
    static deactivate() {
        this.is_active = false;
    }
    static setSaveHandler(file_type: string, handler: (data: OnSaveData) => any) {
        this.save_registry[file_type] = handler;
    }


    static async onDelete(file_path: string) {
        let file_type = FileType.get(file_path);
        let file_uuid = await OmegaCache.loadFileUUID(file_path);

        switch(file_type) {
            case "bridge_map_area": {
                await trash(path.join(CURRENT.PROJECT_PATH, `animation_controllers/bridge/map_area_${file_uuid}.json`));
                try {
                    await trash(path.join(CURRENT.PROJECT_PATH, `animations/bridge/map_area_timer_${file_uuid}.json`));
                } catch(err) {}

                break;
            }
        }
    }

    /**
     * @param {boolean} simulated_call Whether the function call is coming from the JSONFileMasks.apply(...) method. The data received is not open inside a tab
     */
    static async beforeSave(data: any, file_path=TabSystem.getCurrentFilePath(), depth=100, simulated_call=false, file_uuid?: string) {
        if(depth <= 0) {
            new InformationWindow("ERROR", "Maximum import depth reached");
            return data;
        }
        let file_name = path.basename(file_path);
        let file_type = FileType.get(file_path);
        if(file_uuid === undefined)
            file_uuid = await OmegaCache.loadFileUUID(file_path);

        /**
         * Custom entity components & entity tags
         * ---------
         * Needs to be outside of the entity save handler because we need to have tags & components
         * ready for the custom entity syntax pass. That's also why we apply tags and components before all other file masks
         */
        if(file_type === "entity") {
            await ComponentRegistry.parse(file_path, data, simulated_call);
            await handleTags(file_path, use(data, "minecraft:entity/description/tags"), simulated_call);
        }
        data = await JSONFileMasks.applyOnData(file_path, data, layer_name => layer_name.startsWith("component@") || layer_name.startsWith("tag@"));

        //Do not use custom syntax with deactivated bridgeCore
        if(!this.is_active) return data;

        if(typeof this.save_registry[file_type] === "function")
            await this.save_registry[file_type]({ file_path, file_name, file_uuid, data, depth, simulated_call });

        data = await JSONFileMasks.applyOnData(file_path, data, layer_name => !(layer_name.startsWith("component@") || layer_name.startsWith("tag@")));
        await JSONFileMasks.saveMasks();
        return data;
    }

    static get FILE_DEFS() {
        if(!this.is_active) return [];
        return CORE_FILES;
    }
}

//REGISTER HANDLERS
BridgeCore.setSaveHandler("entity", EntityHandler);
BridgeCore.setSaveHandler("item", ItemHandler);
BridgeCore.setSaveHandler("entity_tag", TagHandler);
BridgeCore.setSaveHandler("bridge_map_area", MapAreaHandler);