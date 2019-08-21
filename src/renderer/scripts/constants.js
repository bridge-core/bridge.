import fs from "fs";
import APP_VERSION from "./constants/app_version";
import path from "path";
import { MOJANG_PATH } from "../../shared/Paths";

export { APP_VERSION, MOJANG_PATH };
export const BASE_PATH = path.join(MOJANG_PATH, "development_behavior_packs/");
export const RP_BASE_PATH = path.join(MOJANG_PATH, "development_resource_packs/");
export const WEB_APP_DATA = "https://solveddev.github.io/bridge-data/";
export const WEB_APP_PLUGINS = "https://solveddev.github.io/bridge-plugins/";
export const DOC_LIST = [ "entities", "blocks", "biomes", "addons", "moLang", "UI", "scripting", "particles", "animations", "timelines", "recipes" ];
export const MINECRAFT_VERSIONS = JSON.parse(fs.readFileSync(__static + "\\auto_completions\\versions.json").toString());