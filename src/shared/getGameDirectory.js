import os from "os";
import path from "path";

// taken from minecraft-addon-tools/minecraft-addon-toolchain by @AtomicBlom
const getGameDirectory = () => {
    let platformRoot = null;
    switch (os.platform()) {
        case "win32":
            platformRoot = path.join(
                process.env["LOCALAPPDATA"],
                "Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState"
            );
            break;
        case "linux":
            platformRoot = path.join(os.homedir(), ".local/share/mcpelauncher");
            break;
        case "darwin":
            platformRoot = path.join(os.homedir(), "Library/Application Support/mcpelauncher");
            break;
        case "android":
            platformRoot = path.join(os.homedir(), "storage/shared/");
            break;
        default:
            return;
    }
    return platformRoot;
}

export default getGameDirectory;