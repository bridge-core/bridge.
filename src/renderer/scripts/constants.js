import fs from "fs";
import APP_VERSION from "./constants/app_version";
import path from "path";
import { MOJANG_PATH, BP_BASE_PATH } from "../../shared/Paths";
import Store from "../store/index";

export { APP_VERSION };
export * from "../../shared/Paths.js";
export const BASE_PATH = BP_BASE_PATH;
export const WEB_APP_DATA = "https://solveddev.github.io/bridge-data/";
export const WEB_APP_PLUGINS = "https://solveddev.github.io/bridge-plugins/";
export const DOC_LIST = [ "entities", "Item", "blocks", "biomes", "addons", "moLang", "UI", "scripting", "particles", "animations", "timelines", "recipes" ];
export const MINECRAFT_VERSIONS = JSON.parse(fs.readFileSync(path.join(__static, "auto_completions/versions.json")).toString("UTF-8"));
export const CURRENT = {
    get PROJECT_PATH() {
        return path.join(BASE_PATH, Store.state.Explorer.project.explorer);
    },
    get RP_PATH() {
        return path.join(BASE_PATH, Store.state.Explorer.project.resource_pack);
    }
};