import FileType from "../editor/FileType";
import TabSystem from "../TabSystem";
import OmegaCache from "../editor/OmegaCache";
import { JSONFileMasks } from "../editor/JSONFileMasks";
import path from "path";
import CORE_FILES from "./core_files";

import EntityHandler from "./EntityHandler";
import ItemHandler from "./ItemHandler";
import TagHandler from "./TagHandler";
import InformationWindow from "../commonWindows/Information";
import ComponentRegistry from "../plugins/CustomComponents";

export const UI_DATA = {
    name: "bridge. Core",
    author: "bridge. Team",
    description: "A core library which improves your add-on experience with custom syntax.",
    version: "1.0.0",
    id: "bridge.core"
}

export class BridgeCore {
    static is_active = false;
    static save_registry = {};
    static isActive() {
        return this.is_active;
    }
    static activate() {
        this.is_active = true;
    }
    static deactivate() {
        this.is_active = false;
    }
    static setSaveHandler(file_type, handler) {
        this.save_registry[file_type] = handler;
    }

    /**
     * @param {object} data 
     * @param {string} file_path 
     * @param {number} depth 
     * @param {boolean} simulated_call Whether the function call is coming from the JSONFileMasks.apply(...) method. The data received is not open inside a tab
     */
    static async beforeSave(data, file_path=TabSystem.getCurrentFilePath(), depth=100, simulated_call=false) {
        if(depth <= 0) {
            new InformationWindow("ERROR", "Maximum import depth reached");
            return data;
        }
        let file_name = path.basename(file_path);
        let file_uuid = await OmegaCache.loadFileUUID(file_path);
        let file_type = FileType.get(file_path);

        //CUSTOM ENTITY COMPONENTS
        if(file_type === "entity") await ComponentRegistry.parse(file_path, data, simulated_call);

        data = await JSONFileMasks.applyOnData(file_path, data);

        //Do not use custom syntax with deactivated bridgeCore
        if(!this.is_active) return data;

        if(typeof this.save_registry[file_type] === "function")
            await this.save_registry[file_type]({ file_path, file_name, file_uuid, data, depth, simulated_call });

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