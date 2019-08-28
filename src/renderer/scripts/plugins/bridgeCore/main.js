import FileType from "../../editor/FileType";
import EntityHandler from "./EntityHandler";

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

    static beforeSave(data) {
        if(!this.is_active) return data;

        let file_type = FileType.get();
        if(typeof this.save_registry[file_type] === "function") this.save_registry[file_type](data);

        return data;
    }
}

//REGISTER HANDLERS
BridgeCore.setSaveHandler("entity", EntityHandler);