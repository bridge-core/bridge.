import { CURRENT } from "../constants";
import FileSystem from "../FileSystem";
import JSONTree from "../editor/JsonTree";
import LightningCache from "../editor/LightningCache";
import ComponentRegistry from "../plugins/CustomComponents";


export async function refreshCache(refresh_rp=false) {
    let explorer = refresh_rp ? CURRENT.RPFileExplorer : CURRENT.BPFileExplorer;
    if(explorer === undefined) return;

    let files = explorer.getAllFiles();
    LightningCache.init();
    for(let f of files) {
        let tree = await FileSystem.loadFileAsTree(f);
        if(!(tree instanceof JSONTree)) continue;

        await ComponentRegistry.parse(f, tree.toJSON(), false);
        await LightningCache.add(f, tree, false);
    }
    await LightningCache.saveCache();
}