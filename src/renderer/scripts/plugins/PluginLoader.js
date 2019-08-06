import { BASE_PATH } from "../constants";
import path from "path";
import { promises as fs } from "fs";
import { readJSON } from "../utilities/JsonFS";
import Store from "../../store/index";
import Bridge from "../../scripts/plugins/PluginEnv";

let PLUGIN_FOLDERS;
let PLUGIN_DATA = [];

export default class PluginLoader {
    static async loadPlugins(project) {
        if(project === undefined) return;
        //INIT LEGACY INTERPRETER & UNLOAD LEGACY PLUGINS
        Store.commit("unloadPlugins");
        Bridge.Interpreter.init(project);

        try {
            PLUGIN_FOLDERS = await fs.readdir(path.join(BASE_PATH, project, "bridge/plugins"));
        } catch(e) {
            PLUGIN_FOLDERS = [];
        }
        
        PLUGIN_DATA = [];
        await Promise.all(PLUGIN_FOLDERS.map(plugin_folder => this.loadPlugin(project, plugin_folder)));

        //INIT LEGACY PLUGIN DATA FOR UI
        Store.commit("finishedPluginLoading", PLUGIN_DATA);
    }

    static async loadPlugin(project, plugin_folder) {
        let plugin_path = path.join(BASE_PATH, project, "bridge/plugins", plugin_folder);

        if((await fs.lstat(plugin_path)).isFile()) {
            //LEGACY PLUGINS
            Store.commit("loadPlugin", { 
                code: (await fs.readFile(plugin_path)).toString(), 
                path: plugin_path, 
                blocked: false
            });
        } else {
            let manifest;
            try {
                manifest = await readJSON(path.join(plugin_path, "manifest.json"));
            } catch(e) { return; }

            await this.loadScripts(plugin_path, manifest.api_version);
            PLUGIN_DATA.push(manifest);
        }
    }

    static async loadScripts(plugin_path, api_version) {
        let scripts;
        try {
            scripts = await fs.readdir(path.join(plugin_path, "scripts"));
        } catch(e) { return; }

        let data = await Promise.all(scripts.map(s => fs.readFile(path.join(plugin_path, "scripts", s))));
        data.forEach((d, i) => {
            if(api_version === 1) {
                Bridge.Interpreter.execute(
                    d.toString(), 
                    path.join(plugin_path, "scripts", scripts[i]),
                    undefined,
                    true
                )
            } else if(api_version === 2 || api_version === undefined) {

            } else {
                throw new Error("Undefined API Version: " + api_version);
            }
        });
    }
}