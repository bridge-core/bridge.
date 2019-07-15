import { BASE_PATH } from "../constants";
import path from "path";
import fs from "fs";
import { readJSON } from "../utilities/JsonFS";

function readDir(path) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            if(err) reject(err);
            else resolve(files);
        })
    })
}

let PLUGIN_FOLDERS;
let PLUGIN_DATA = [];

export default class PluginLoader {
    static async loadPlugins(project) {
        if(project === undefined) return;
        try {
            PLUGIN_FOLDERS = await readDir(path.join(BASE_PATH, project, "bridge/plugins"));
        } catch(e) {
            PLUGIN_FOLDERS = [];
        }
        
        console.log(PLUGIN_FOLDERS);
        PLUGIN_DATA = [];
        await Promise.all(PLUGIN_FOLDERS.map(plugin_folder => this.loadPlugin(project, plugin_folder)));
        console.log(PLUGIN_DATA);
    }

    static async loadPlugin(project, plugin_folder) {
        let plugin_path = path.join(BASE_PATH, project, "bridge/plugins", plugin_folder);
        let manifest;
        try {
            manifest = await readJSON(path.join(plugin_path, "manifest.json"));
        } catch(e) {
            return;
        }
        PLUGIN_DATA.push(manifest);
    }
}