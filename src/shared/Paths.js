
import path from "path"
import { DefaultDir } from "../main/DefaultDir";
let default_dir = DefaultDir.get();

export const MOJANG_PATH = (() => {
    if(default_dir !== "") {
        return default_dir;
    } else if (process.platform == "win32") {
        return path.join(process.env.LOCALAPPDATA, "Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/");
    } else {
        return path.join(process.env.HOME, ".local/share/mcpelauncher/games/com.mojang/")
    }
})();

export const BP_BASE_PATH = path.join(MOJANG_PATH, "development_behavior_packs/");
export const RP_BASE_PATH = path.join(MOJANG_PATH, "development_resource_packs/");
