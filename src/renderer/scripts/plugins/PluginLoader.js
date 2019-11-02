/**
 * Powerful bridge. PluginLoader
 * Loads v1 & v2 plugins
 * 
 * Unloading is still handled by store/modules/Plugins.js
 */
import { BASE_PATH } from "../constants";
import path from "path";
import { promises as fs, createReadStream } from "fs";
import { readJSON } from "../utilities/JsonFS";
import Store from "../../store/index";
import Bridge from "../../scripts/plugins/PluginEnv";
import EventBus from "../EventBus";
import { PluginSnippets } from "../../windows/Snippets";
import { UI_DATA, BridgeCore } from "../bridgeCore/main";
import ThemeManager from "../editor/ThemeManager";
import unzipper from "unzipper";
import safeEval from "safe-eval";
import ComponentRegistry, { BridgeComponent } from "./CustomComponents";
import InformationWindow from "../commonWindows/Information";
import Provider from "../autoCompletions/Provider";

let PLUGIN_FOLDERS;
let PLUGIN_DATA = [];

export default class PluginLoader {
    static unloaded_plugins;

    static getInstalledPlugins() {
        return PLUGIN_DATA;
    }
    static pushPluginData(data) {
        PLUGIN_DATA.push(data);
    }

    static reset() {
        ComponentRegistry.reset();
    }

    static async loadPlugins(project) {
        if(project === undefined) return;
        //INIT LEGACY INTERPRETER & UNLOAD LEGACY PLUGINS
        Store.commit("unloadPlugins");
        
        let unloaded_plugins = await Bridge.Interpreter.init(project);
        this.unloaded_plugins = unloaded_plugins;
        //Activate/Deactivate BridgeCore
        if(!unloaded_plugins.includes("bridge.core")) BridgeCore.activate();
        else BridgeCore.deactivate();

        try {
            PLUGIN_FOLDERS = await fs.readdir(path.join(BASE_PATH, project, "bridge/plugins"));
        } catch(e) {
            PLUGIN_FOLDERS = [];
        }

        let PLUGIN_ZIPS = PLUGIN_FOLDERS.filter(p => path.extname(p) === ".zip");
        PLUGIN_FOLDERS = PLUGIN_FOLDERS.filter(p => path.extname(p) !== ".zip");
        //Initialize PLUGIN_DATA with UI_DATA of BridgeCore
        PLUGIN_DATA = [ UI_DATA ];
        await Promise.all(PLUGIN_ZIPS.map(plugin_folder => this.loadPlugin(project, plugin_folder, unloaded_plugins)));
        await Promise.all(PLUGIN_FOLDERS.map(plugin_folder => this.loadPlugin(project, plugin_folder, unloaded_plugins)));
        await ThemeManager.loadTheme();
        //UPDATE COMPONENT REFERENCES
        await ComponentRegistry.registerUpdates();

        //INIT LEGACY PLUGIN DATA FOR UI
        Store.commit("finishedPluginLoading", PLUGIN_DATA);
        EventBus.trigger("bridge:pluginsLoaded");
    }

    static async loadPlugin(project, plugin_folder, unloaded_plugins) {
        let plugin_path = path.join(BASE_PATH, project, "bridge/plugins", plugin_folder);
        if((await fs.lstat(plugin_path)).isFile()) {
            if(path.extname(plugin_path) === ".js") {
                //LEGACY PLUGINS
                Store.commit("loadPlugin", {
                    code: (await fs.readFile(plugin_path)).toString(), 
                    path: plugin_path, 
                    blocked: unloaded_plugins.includes(path.basename(plugin_path, ".js"))
                });
            } else if(path.extname(plugin_path) === ".zip") {
                //Load archived plugins
                let unzip_path = path.join(BASE_PATH, project, "bridge/plugins", path.basename(plugin_folder, ".zip"));
                await createReadStream(plugin_path)
                    .pipe(unzipper.Extract({ path: unzip_path }))
                    .promise();
                
                /**
                 * Prevent loading plugin twice
                 * (once as folder and once as .zip)
                 */
                if(PLUGIN_FOLDERS.includes(path.basename(plugin_folder, ".zip"))) {
                    PLUGIN_FOLDERS = PLUGIN_FOLDERS.filter(p => p !== path.basename(plugin_folder, ".zip"));
                }

                await Promise.all([
                    fs.unlink(plugin_path),
                    this.loadPlugin(project, path.basename(plugin_folder, ".zip"), unloaded_plugins)
                ]).catch(e => {});
            }
        } else {
            let manifest;
            try {
                manifest = await readJSON(path.join(plugin_path, "manifest.json"));
            } catch(e) { return; }

            //IF ACTIVE: LOAD PLUGIN
            if(manifest.id && !unloaded_plugins.includes(manifest.id)) {
                await Promise.all([
                    this.loadScripts(plugin_path, manifest.api_version),
                    this.loadSnippets(plugin_path),
                    this.loadThemes(plugin_path),
                    this.loadComponents(plugin_path),
                    this.loadAutoCompletions(plugin_path)
                ]).catch(e => {});
            } 
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
                );
            } else if(api_version === 2 || api_version === undefined) {

            } else {
                throw new Error("Undefined API Version: " + api_version);
            }
        });
    }

    static async loadSnippets(plugin_path) {
        let snippets = await fs.readdir(path.join(plugin_path, "snippets")).catch(e => []);

        snippets = await Promise.all(
            snippets.map(s => 
                readJSON(path.join(plugin_path, "snippets", s))
                    .catch(e => undefined)
            )
        );
        snippets.forEach(s => {
            if(s !== undefined) PluginSnippets.add(s);
        });
    }

    static async loadThemes(plugin_path) {
        let themes = await fs.readdir(path.join(plugin_path, "themes")).catch(e => []);

        themes = await Promise.all(
            themes.map(t => 
                readJSON(path.join(plugin_path, "themes", t))
                    .catch(e => undefined)
            )
        );
        themes.forEach(t => {
            if(t !== undefined) ThemeManager.addTheme(t);
        });
    }

    static async loadComponents(plugin_path) {
        let components = await fs.readdir(path.join(plugin_path, "components")).catch(e => []);

        components = await Promise.all(
            components.map(c => 
                fs.readFile(path.join(plugin_path, "components", c))
                    .catch(e => undefined)
            )
        );
        await Promise.all(components.map(async c => {
            if(c === undefined) return;
            
            try {
                await safeEval(c.toString("utf-8"), {
                    Bridge: {
                        register: (c) => ComponentRegistry.register(c),
                        report: (info) => new InformationWindow("Information", info, false)
                    }
                });
            } catch(e) { new InformationWindow("ERROR", `Error while loading custom component:\n${e.message}`); }
        }));
    }

    static async loadAutoCompletions(plugin_path) {
        let auto_completions = await fs.readdir(path.join(plugin_path, "auto_completions")).catch(e => []);

        auto_completions = await Promise.all(
            auto_completions.map(a => 
                readJSON(path.join(plugin_path, "auto_completions", a))
                    .catch(e => undefined)
            )
        );

        auto_completions.forEach(({ path, definition }={}) => {
            if(path === undefined || definition === undefined) return;
            Provider.addPluginCompletion(path, definition);
        });
    }
}