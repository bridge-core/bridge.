/**
 * Implements JSONNode (JSONTree.js) shortcuts
 */
import TabSystem from "../TabSystem";
import { clipboard } from "electron";
import { JSONAction } from "../TabSystem/CommonHistory";
import JSONTree from "./JsonTree";

export default class NodeShortcuts {
    private static transformKey(str: string, node: JSONTree): string {
        let match = str.match(/(.+_)(\d+)/);
        if(match !== null) {
            return match[1] + (Number(match[2]) + 1);
        } else if(node.hasChild(str)) {
            str += "_copy";
        }
        return str;
    }

    static paste() {
        let node = TabSystem.getCurrentNavObj();
        try {
            let obj = JSON.parse(clipboard.readText());
            let res: any = {};
            for(let key in obj)
                res[this.transformKey(key, node)] = obj[key];

            node.buildFromObject(res, undefined, true);
            TabSystem.setCurrentUnsaved();
            return true;
        } catch(e) {
            //Try again with a fix if the key was still in front
            try {
                let obj = JSON.parse("{" + clipboard.readText() + "}");
                let res: any = {};
                for(let key in obj)
                    res[this.transformKey(key, node)] = obj[key];

                node.buildFromObject(res, undefined, true);
                TabSystem.setCurrentUnsaved();
                return true;
            } catch(e) {
                return false;
            }
        }
    }
    static copy(node=TabSystem.getCurrentNavObj()) {
        try {
            let obj = { [node.key]: node.toJSON() };
            clipboard.writeText(JSON.stringify(obj, null, "\t"));
            return true;
        } catch(e) {
            return false;
        }
    }
    static cut() {
        try {
            let node = TabSystem.getCurrentNavObj();
            //HISTORY
            TabSystem.getHistory().add(new JSONAction("add", node.parent, node));

            if(this.copy(node)) {
                TabSystem.deleteCurrent();
                TabSystem.setCurrentFileNav("global");
                TabSystem.setCurrentUnsaved();
            }
        } catch(e) {

        }
    }
}