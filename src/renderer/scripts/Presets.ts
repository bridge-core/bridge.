import { promises as fs } from "fs";
import path from "path";
import { readJSON, writeJSON } from "./Utilities/JsonFS";
import ProjectConfig from "./Project/Config";
import { CURRENT } from "./constants";
import { detachMerge } from "./Utilities/mergeUtils";
import InformationWindow from "./commonWindows/Information";
import { trySetRP } from "./Utilities/FindRP";
declare var __static: string;

let LOAD_LOCATIONS: string[] = [];

export function addLoadLocation(str: string) {
    LOAD_LOCATIONS.push(str);
}
export function resetLoadLocations() {
    LOAD_LOCATIONS = [];
}

export interface IManifest {
    display_name?: string;
    description?: string;
    icon?: string;
    rp_map?: {
        [file_path: string]: string;
    }
    bp_map?: {
        [file_path: string]: string;
    }
    expand_rp_files?: {
        [file_path: string]: string;
    }
    expand_bp_files?: {
        [file_path: string]: string;
    }
    copy_rp_files?: {
        [file_path: string]: string;
    }
}

export interface IPresetData {
    folder_path: string;
    manifest: IManifest;
}

export interface IPresetEnv {
    IDENTIFIER: string;
    PROJ_PREFIX: string;
    [x: string]: string;
}

export async function loadPresets() {
    let manifests: IPresetData[] = [];
    await Promise.all(
        [path.join(__static, "presets")]
            .concat(LOAD_LOCATIONS)
            .map(async load_path => {
                await Promise.all(
                    (await fs.readdir(load_path, { withFileTypes: true })).map(async dirent => {
                        if(dirent.isFile()) return; //Only folders are valid presets

                        try {
                            manifests.push({
                                folder_path: path.join(load_path, dirent.name),
                                manifest: await readJSON(path.join(load_path, dirent.name, "manifest.json"))
                            });
                        } catch {}
                    })
                )
            })
    );
    return manifests;
}

export async function buildPreset(preset: IPresetData, identifier: string) {
    if(!(await trySetRP()))
        return new InformationWindow("No Resource Pack", "Please create or connect a resource pack before creating a preset.");

    const { folder_path, manifest: { bp_map={}, rp_map={}, expand_bp_files={}, expand_rp_files={}, copy_rp_files= {} }={} } = preset;
    const ENV: IPresetEnv = {
        IDENTIFIER: identifier,
        PROJ_PREFIX: await ProjectConfig.prefix
    }
    let promises = [];

    promises.push(...Object.entries(bp_map)
        .map(([preset_path, create_path]) => buildPresetFile(
            path.join(folder_path, preset_path),
            path.join(CURRENT.PROJECT_PATH, create_path, identifier + ".json"), ENV)
        ));
    promises.push(...Object.entries(rp_map)
        .map(([preset_path, create_path]) => buildPresetFile(
            path.join(folder_path, preset_path),
            path.join(CURRENT.RP_PATH, create_path, identifier + ".json"), ENV)
        ));

    promises.push(...Object.entries(expand_bp_files)
        .map(([preset_path, expand_path]) => expandPresetFile(
            path.join(folder_path, preset_path),
            path.join(CURRENT.PROJECT_PATH, expand_path), ENV)
        ));
    promises.push(...Object.entries(expand_rp_files)
        .map(([preset_path, expand_path]) => expandPresetFile(
            path.join(folder_path, preset_path),
            path.join(CURRENT.RP_PATH, expand_path), ENV)
        ));

    promises.push(...Object.entries(copy_rp_files)
        .map(async ([preset_path, copy_path]) => {
            let file_path = path.join(CURRENT.RP_PATH, copy_path, identifier + path.extname(preset_path));

            await fs.mkdir(path.dirname(file_path), { recursive: true });
            await fs.copyFile(
                path.join(folder_path, preset_path),
                file_path
            );
        }));
    
    await Promise.all(promises)
        .catch(console.error)
}

export async function buildPresetFile(from_path: string, to_path: string, ENV: IPresetEnv) {
    let templ = (await fs.readFile(from_path)).toString("UTF-8");
    templ = templ.replace(/{{[^{}]+}}/g, (match: string) => ENV[match.replace(/{{|}}/g, "")] || "undefined");

    await fs.mkdir(path.dirname(to_path), { recursive: true });
    await fs.writeFile(to_path, templ);
}

export async function expandPresetFile(from_path: string, to_path: string, ENV: IPresetEnv) {
    let original = {};
    try {
        original = await readJSON(to_path);
    } catch(e) { console.log(e) }

    let templ = (await fs.readFile(from_path)).toString("UTF-8");
    templ = templ.replace(/{{[^{}]+}}/g, (match: string) => ENV[match.replace(/{{|}}/g, "")] || "undefined");

    await fs.mkdir(path.dirname(to_path), { recursive: true });
    await writeJSON(to_path, detachMerge({}, original, JSON.parse(templ)));
}