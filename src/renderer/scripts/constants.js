import IMP_FILE_TEMPLATES from "./constants/file_templates";
import uuidv4 from "uuid/v4";

export const MOJANG_PATH = `C:/Users/${process.env.USERNAME}/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/`;
export const BASE_PATH = MOJANG_PATH + "development_behavior_packs/";
export const APP_VERSION = "v0.8.0";
export const WEB_APP_DATA = "https://solveddev.github.io/bridge-data/";
export const WEB_APP_PLUGINS = "https://solveddev.github.io/bridge-plugins/";
export const FILE_TEMPLATES = IMP_FILE_TEMPLATES;
export const MANIFEST_TEMPLATE = (name="", des="") => `{
	"format_version": 1,
	"header": {
		"description": "${des}",
		"name": "${name}",
		"uuid": "${uuidv4()}",
		"version": [
			1,
			0,
			0
		],
		"min_engine_version": [
			1,
			0,
			0
		]
	},
	"modules": [
		{
			"type": "data",
			"uuid": "${uuidv4()}",
			"version": [
				1,
				0,
				0
			]
		}
	]
}`;