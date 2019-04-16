import IMP_FILE_TEMPLATES from "./constants/file_templates";
import uuidv4 from "uuid/v4";
import fs from "fs";
import path from "path";
import a_v from "./constants/app_version";
import getGameDirectory from "../../shared/getGameDirectory"

export const MOJANG_PATH = path.join(getGameDirectory(), "/games/com.mojang");
export const BASE_PATH = path.join(MOJANG_PATH, "/development_behavior_packs");
export const APP_VERSION = a_v;
export const WEB_APP_DATA = "https://solveddev.github.io/bridge-data/";
export const WEB_APP_PLUGINS = "https://solveddev.github.io/bridge-plugins/";
export const FILE_TEMPLATES = IMP_FILE_TEMPLATES;
export const DOC_LIST = [ "entities", "addons", "moLang", "UI", "scripting", "particles", "animations", "timelines" ];
export const MINECRAFT_VERSIONS = JSON.parse(fs.readFileSync(path.join(__static, "/auto_completions/versions.json")).toString());
export const MANIFEST_TEMPLATE = (name="", des="") => `{
	"format_version": 1,
	"header": {
		"description": "${des}",
		"name": "${name}",
		"uuid": "${uuidv4()}",
		"version": [ 1, 0, 0 ],
		"min_engine_version": [ 1, 0, 0 ]
	},
	"modules": [
		{
			"type": "data",
			"uuid": "${uuidv4()}",
			"version": [ 1, 0, 0 ]
		},
		{
            "type": "client_data",
            "uuid": "${uuidv4()}",
            "version": [ 1, 0, 0 ]
        }
	]
}`;