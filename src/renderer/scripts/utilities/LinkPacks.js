import fs from "fs";
import { BASE_PATH, RP_BASE_PATH } from "../constants";
import InformationWindow from "../commonWindows/Information";
import LoadingWindow from "../../windows/LoadingWindow";
import { setRP } from "./FindRP";
import EventBus from "../EventBus";

function readJSON(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if(err) reject(err);
            else resolve(JSON.parse(data.toString()));
        });
    });
}
function writeJSON(path, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, JSON.stringify(data), (err) => {
            if(err) reject(err);
            else resolve();
        });
    });
}

export default class PackLinker {
    static async link(bp_name, rp_name) {
        let lw = new LoadingWindow();
        try {
            let bp_data = await readJSON(`${BASE_PATH}${bp_name}/manifest.json`);
            let rp_data = await readJSON(`${RP_BASE_PATH}${rp_name}/manifest.json`);

            bp_data.dependencies = [
                {
                    version: rp_data.header.version,
                    uuid: rp_data.header.uuid
                }
            ];

            await writeJSON(`${BASE_PATH}${bp_name}/manifest.json`, bp_data);
            await setRP(rp_name);
            EventBus.trigger("bridge:refreshExplorer", rp_name);
            lw.close();
        } catch(e) {
            lw.close();
            let i = new InformationWindow("Unable to link packs", `bridge. failed to link the packs ${bp_name} and ${rp_name}.`);
        }
    }
}