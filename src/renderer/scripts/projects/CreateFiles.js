import { promises as fs } from "fs";
import path from "path";

export default class CreateFiles {
    create;

    static async load() {
        this.create = JSON.parse((await fs.readFile(path.join(__static, "data/create_project.json"))).toString());
    }

    static async createRPFiles(base_path) {
        if(this.create === undefined) await this.load();
        let proms = [];
        
        await Promise.all(this.create.RP.folders.map(async f => fs.mkdir(path.join(base_path, f), { recursive: true })));
        
        for(let data_name in this.create.RP.files) {
            fs.copyFile(path.join(__static, "data", data_name), path.join(base_path, this.create.RP.files[data_name]));
        }

        await Promise.all(proms);
    }

    static async createBPFiles(base_path) {
        if(this.create === undefined) await this.load();
        let proms = [];
        
        await Promise.all(this.create.BP.folders.map(async f => await fs.mkdir(path.join(base_path, f), { recursive: true })));

        for(let data_name in this.create.BP.files) {
            fs.copyFile(path.join(__static, "data", data_name), path.join(base_path, this.create.BP.files[data_name]));
        }

        await Promise.all(proms);
    }
}