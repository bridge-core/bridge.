import { join } from "path"

export const MOJANG_PATH = (() => {
    if (process.platform == "win32") {
        return join(process.env.LOCALAPPDATA, "Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/");
    } else {
        return join(process.env.HOME, ".local/share/mcpelauncher/games/com.mojang/")
    }
})();

export const BP_BASE_PATH = join(MOJANG_PATH, "development_behavior_packs/");
export const RP_BASE_PATH = join(MOJANG_PATH, "development_resource_packs/");
