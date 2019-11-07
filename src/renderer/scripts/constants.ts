declare var __static: string;

import fs from "fs";
import APP_VERSION from "../../shared/app_version";
import path from "path";
import { MOJANG_PATH, BP_BASE_PATH, RP_BASE_PATH } from "../../shared/Paths";
import Store from "../store/index";

export const WEB_APP_DATA = "https://solveddev.github.io/bridge-data/";
export const WEB_APP_PLUGINS = "https://solveddev.github.io/bridge-plugins/";

export const DOC_URL = "https://bedrock.dev/1.14.0.0/1.14.0.1/";
export const DOC_LIST = [ "Entities", "Item", "Blocks", "Biomes", "Addons", "MoLang", "UI", "Scripting", "Particles", "Animations", "Entity Events", "Recipes" ];

export const MINECRAFT_VERSIONS = JSON.parse(fs.readFileSync(path.join(__static, "auto_completions/versions.json")).toString("UTF-8"));

export { APP_VERSION, MOJANG_PATH };
export * from "../../shared/Paths";
export const BASE_PATH = BP_BASE_PATH;

export const CURRENT = {
    get PROJECT_PATH() {
        return path.join(BASE_PATH, Store.state.Explorer.project.explorer);
    },
    get PROJECT() {
        return Store.state.Explorer.project.explorer;
    },
    get RP_PATH() {
        return path.join(RP_BASE_PATH, Store.state.Explorer.project.resource_pack);
    }
};