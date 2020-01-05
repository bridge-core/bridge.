import { promises as fs } from "fs";
import path from "path";
import { readJSON } from "../Utilities/JsonFS";

export default class AnimationController {
    format_version = "1.10.0";
    animation_controllers = {};

    async load(file_path: string) {
        try {
            let { format_version, animation_controllers } = await readJSON(file_path);
            this.format_version = format_version;
            this.animation_controllers = animation_controllers;
        } catch(e) {}
    }

    async save(file_path: string) {
        if(Object.keys(this.animation_controllers).length === 0) return;
        
        await fs.mkdir(path.dirname(file_path), { recursive: true });
        await fs.writeFile(file_path, JSON.stringify({
            format_version: this.format_version,
            animation_controllers: this.animation_controllers
        }, null, "\t"));
    }
}