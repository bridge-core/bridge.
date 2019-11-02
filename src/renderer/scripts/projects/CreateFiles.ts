/**
 * Creates single instance files such as item_texture.json, pack_icon.png, biomes_client.json etc.
 * Data-driven through "data/create_project.json" file
 */
import { promises as fs } from "fs";
import path from "path";

declare var __static: string;

interface createProjectObj {
    RP: { folders: string[], files: { [f: string]: string } };
    BP: { folders: string[], files: { [f: string]: string } };
}

export default class CreateFiles {
    static create: createProjectObj;

    static async load() {
        this.create = JSON.parse((await fs.readFile(path.join(__static, "data/create_project.json"))).toString());
    }

    static async createRPFiles(base_path: string) {
        if(this.create === undefined) await this.load();
        let proms: Promise<void>[] = [];
        
        await Promise.all(this.create.RP.folders.map(async f => fs.mkdir(path.join(base_path, f), { recursive: true })));
        
        for(let data_name in this.create.RP.files) {
            proms.push(fs.copyFile(path.join(__static, "data", data_name), path.join(base_path, this.create.RP.files[data_name])));
        }

        await Promise.all(proms);
    }

    static async createBPFiles(base_path: string) {
        if(this.create === undefined) await this.load();
        let proms: Promise<void>[] = [];
        
        await Promise.all(this.create.BP.folders.map(async f => await fs.mkdir(path.join(base_path, f), { recursive: true })));

        for(let data_name in this.create.BP.files) {
            proms.push(fs.copyFile(path.join(__static, "data", data_name), path.join(base_path, this.create.BP.files[data_name])));
        }

        await Promise.all(proms);
    }
}