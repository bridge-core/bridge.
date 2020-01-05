/**
 * Creates single instance files such as item_texture.json, pack_icon.png, biomes_client.json etc.
 * Data-driven through "data/create_project.json" file
 */
import { promises as fs } from "fs";
import path from "path";
import { escapeRegExpStr } from "../Utilities/EscapeRegExp";

declare var __static: string;

interface EnvConfig {
    name: string;
    description: string;
    [s: string]: string;
}

interface Replacer { 
    file: string;
    with: { [s: string]: string }
}

interface CreatePackConfig {
    folders: string[];
    files: { 
        [f: string]: string | Replacer
    };
}

interface CreateProjectConfig {
    RP: CreatePackConfig;
    BP: CreatePackConfig;
}


export default class CreateFiles {
    static create: CreateProjectConfig;

    static async load() {
        this.create = JSON.parse((await fs.readFile(path.join(__static, "data/create_project.json"))).toString());
    }

    static async createPack(base_path: string, pack: CreatePackConfig, env?: EnvConfig) {
        let proms: Promise<void>[] = [];

        await Promise.all(pack.folders.map(async f => fs.mkdir(path.join(base_path, f), { recursive: true })));
        
        for(let data_name in pack.files) {
            if(typeof pack.files[data_name] === "string") {
                proms.push(
                    fs.copyFile(path.join(__static, "data", data_name), path.join(base_path, pack.files[data_name] as string))
                );
            } else {
                proms.push(
                    this.parseReplacer(data_name, base_path, pack.files[data_name] as Replacer, env)
                );
            }
        }

        await Promise.all(proms);
    }

    static async parseReplacer(p: string, base_path: string, r: Replacer, env?: EnvConfig) {
        const { file, with: with_repl } = r;

        let file_content = (await fs.readFile(path.join(__static, "data", p))).toString();

        for(let repl in with_repl) {
            let statement = with_repl[repl];

            if(statement[0] === "$" && env !== undefined)
                statement = env[statement.substr(1, statement.length)];

            file_content = file_content.replace(new RegExp(escapeRegExpStr(repl), "g"), statement || with_repl[repl]);
        }
            
        
        await fs.writeFile(path.join(base_path, file), file_content);
    }

    static async createRPFiles(base_path: string, env?: EnvConfig) {
        if(this.create === undefined)
            await this.load();

        await this.createPack(base_path, this.create.RP, env);
    }

    static async createBPFiles(base_path: string, env?: EnvConfig) {
        if(this.create === undefined)
            await this.load();

        await this.createPack(base_path, this.create.BP, env);
    }
}