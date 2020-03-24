import * as VERSION_UTILS from "./VersionUtils";
import { WEB_APP_DATA, APP_VERSION } from "../constants";
import { isUndefined } from "util";

export interface newVersionRes {
      description?: string;
      latest_version?: string;
      update_available?: boolean;
      downloads?: number;
      latest_version_name?: string;
      urls?: Array<string>;
}

export default async function fetchLatestJson() {
      let res: newVersionRes = {};
      await fetch("https://api.github.com/repos/bridge-core/bridge./releases/latest")
        .then(data => data.json())
        .then((data) => {
            console.log(`Running bridge. ${APP_VERSION} | Latest: ${data.tag_name}`);
            res.latest_version = data.tag_name;
            res.description = String(data.body);
            res.downloads = 0;
            res.urls = Array<string>();
            res.latest_version_name = data.name;
            for (let asset of data.assets) {
                res.downloads += Number(asset.download_count);
                res.urls.push(String(asset.browser_download_url))
            }
        })
        .catch((e) => {
            console.log(`Running bridge. ${APP_VERSION} | Unable to get latest version`);
            console.log(e);
            res.update_available = false;
        });

    return res;
}