import { DefaultDir } from "./DefaultDir";

let default_dir = DefaultDir.get();
export const MOJANG_PATH = default_dir !== "" ? 
    default_dir :
    `${process.env.LOCALAPPDATA.replace(/\\/g, "/")}/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/`;

export const BP_BASE_PATH = MOJANG_PATH + "development_behavior_packs/";
export const RP_BASE_PATH = MOJANG_PATH + "development_resource_packs/";