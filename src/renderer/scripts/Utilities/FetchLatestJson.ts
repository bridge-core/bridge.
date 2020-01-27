import * as VERSION_UTILS from "./VersionUtils";

export interface newVersionRes {
      decription?: string;
      version?: string;
      update_avaiable?: boolean;
}

export default async function fetchLatestJson() {
      let res: newVersionRes = {};
      await fetch("hhttps://api.github.com/repos/bridge-core/bridge./releases/latest")
        .then(data => {
            let json_data = data.json();
            res.decription = data.
        })

    return res;
}