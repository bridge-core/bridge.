/**
 * @todo Automatically update bridge.
 * @todo Detect electron updates manually to force update with the installer
 */
import path from "path";
import { platform, tmpdir } from "os";
import { downloadFile } from "./ConnectionStatus";
import { access } from "fs";
import LoadingWindow from "../../windows/LoadingWindow";
import { shell, app, systemPreferences } from "electron";

export default async function updateApp(urls: Array<string>) {
    // log dev things
    console.log("running on: "+platform());
    console.log("user tmpdir set to:"+tmpdir());

    let url: string;
    let file_path = tmpdir + path.sep+"bridgeInstaller";
    let extension: string;
    const lw = new LoadingWindow("com.enderzombi102.updateWindow");
    if (platform() == "darwin") {
        url = urls[urls.indexOf(".dmg")];
        extension = ".dmg";
    } else if (platform() == "win32") {
        url = urls[urls.indexOf(".exe")];
        extension = ".exe";
    } else if (platform() == "linux") {
        url = urls[urls.indexOf(".AppImage")];
        extension = ".AppImage"
    } else {
        lw.close();
        throw new Error("ERROR! Your platform isn't supported by the auto updater, please update manually.");
    }
    file_path = file_path.concat(extension);
    await downloadFile(url, file_path);
    lw.close();
}
