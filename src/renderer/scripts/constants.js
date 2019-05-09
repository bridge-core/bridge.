import IMP_FILE_TEMPLATES from "./constants/file_templates";
import uuidv4 from "uuid/v4";
import fs from "fs";
import a_v from "./constants/app_version";

export const MOJANG_PATH = `${process.env.LOCALAPPDATA.replace(/\\/g, "/")}/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/`;
export const BASE_PATH = MOJANG_PATH + "development_behavior_packs/";
export const APP_VERSION = a_v;
export const WEB_APP_DATA = "https://solveddev.github.io/bridge-data/";
export const WEB_APP_PLUGINS = "https://solveddev.github.io/bridge-plugins/";
export const FILE_TEMPLATES = IMP_FILE_TEMPLATES;
export const DOC_LIST = [ "entities", "blocks", "biomes", "addons", "moLang", "UI", "scripting", "particles", "animations", "timelines" ];
export const MINECRAFT_VERSIONS = JSON.parse(fs.readFileSync(__static + "\\auto_completions\\versions.json").toString());