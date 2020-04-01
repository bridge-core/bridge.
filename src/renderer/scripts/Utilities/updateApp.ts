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
    console.log("user tmpdir set to: "+tmpdir());

    let url: string;
    let file_path = tmpdir + path.sep;
    let extension: string;
    const lw = new LoadingWindow("com.enderzombi102.updateWindow");
    if (platform() == "darwin") {
        for (let i in urls) {
            if (urls[i].indexOf(".dmg") != -1) url = urls[i];
        }
    } else if (platform() == "win32") {
        for (let i in urls) {
            if (urls[i].indexOf(".exe") != -1) url = urls[i];
        }
    } else if (platform() == "linux") {
        for (let i in urls) {
            if (urls[i].indexOf(".AppImage") != -1) url = urls[i];
        }
    } else {
        console.log("if this get executed, its bad");
        lw.close();
        throw new Error("ERROR! Your platform isn't supported by the auto updater, please update manually.");
    }
    if (url.indexOf("%40") != -1) url = url.replace("%40", "@");
    await downloadFile(url, file_path);
    lw.close();
}
