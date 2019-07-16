import fs from "fs";
import APP_VERSION from "./constants/app_version";
import path from "path";
import { BP_BASE_PATH } from "../../shared/Paths.js"

export { APP_VERSION };
export * from "../../shared/Paths.js";
export const BASE_PATH = BP_BASE_PATH;
export const WEB_APP_DATA = "https://solveddev.github.io/bridge-data/";
export const WEB_APP_PLUGINS = "https://solveddev.github.io/bridge-plugins/";
export const DOC_LIST = [ "entities", "blocks", "biomes", "addons", "moLang", "UI", "scripting", "particles", "animations", "timelines" ];
export const MINECRAFT_VERSIONS = JSON.parse(fs.readFileSync(path.join(__static, "auto_completions/versions.json")).toString("UTF-8"));