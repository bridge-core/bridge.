import * as VERSION_UTILS from "./VersionUtils";
import { WEB_APP_DATA, APP_VERSION } from "../constants";

export interface newVersionRes {
      description?: string;
      latest_version?: string;
      update_available?: boolean;
      downloads?: number;
}

export default async function fetchLatestJson() {
      let res: newVersionRes = {};
      await fetch("https://api.github.com/repos/bridge-core/bridge./releases/latest")
        .then(data => {
            let json_data = data.json();
            console.log(`Running bridge. ${APP_VERSION} | Latest: ${json_data.tag_name}`);
            res.latest_version = json_data.tag_name;
            res.description = String(json_data.body);
            for (let asset of json_data.assets) {
                res.downloads += asset.download_count;
            }
        })
        .catch(() => {
            console.log(`Running bridge. ${APP_VERSION} | Unable to get latest version`);
            res.update_available = false;
        });

    return res;
}