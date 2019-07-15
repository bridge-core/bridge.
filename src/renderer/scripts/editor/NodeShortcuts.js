import TabSystem from "../TabSystem";
import { clipboard } from "electron";
import { JSONAction } from "../TabSystem/CommonHistory";

export default class NodeShortcuts {
    static paste() {
        try {
            TabSystem.getCurrentNavObj().buildFromObject(JSON.parse(clipboard.readText()), undefined, true);
            TabSystem.setCurrentUnsaved();
            return true;
        } catch(e) {
            //Try again with a fix if the key was still in front
            try {
                TabSystem.getCurrentNavObj().buildFromObject(JSON.parse("{" + clipboard.readText() + "}"), undefined, true);
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

            console.log(e)
        }
    }
}