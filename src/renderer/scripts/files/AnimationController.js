import { promises as fs } from "fs";
import path from "path";

export default class AnimationController {
    format_version = "1.10.0";
    animation_controllers = {};

    async save(file_path) {
        if(Object.keys(this.animation_controllers).length === 0) return;
        
        await fs.mkdir(path.dirname(file_path), { recursive: true });
        await fs.writeFile(file_path, JSON.stringify({
            format_version: this.format_version,
            animation_controllers: this.animation_controllers
        }, null, "\t"));
    }
}