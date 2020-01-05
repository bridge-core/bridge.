import ContentWindow from "../scripts/commonWindows/Content";
import { FileExplorerStorage, FileExplorer } from "../scripts/Sidebar/FileExplorer";
import { CURRENT, BP_BASE_PATH, RP_BASE_PATH } from "../scripts/constants";
import FileSystem from "../scripts/FileSystem";
import path from "path";

function loadFiles(): { text: string, value: string }[] {
    const BP = FileExplorerStorage.get("explorer", CURRENT.PROJECT)
        .getAllFiles().map(p => ({ text: path.relative(BP_BASE_PATH, p).replace(/\\/g, "/"), value: p }));
    //Resource Pack may be undefined
    const RP = FileExplorerStorage.get("resource_pack", CURRENT.RESOURCE_PACK)
        ?.getAllFiles()?.map((p: string) => ({ text: path.relative(RP_BASE_PATH, p).replace(/\\/g, "/"), value: p }))
    return BP.concat(RP || []);
}

class GoToFileWindow extends ContentWindow {
    private content: any[];
    constructor() {
        super({
            options: {
                is_visible: true,
                is_frameless: true,
                is_persistent: false,
                height: 150
            },
            content: [
                {
                    type: "header",
                    text: "Search Files"
                },
                {
                    type: "divider"
                },
                {
                    type: "autocomplete",
                    text: "Search...",
                    has_focus: true,
                    options: loadFiles(),
    
                    action: (val: string) => {
                        this.close();
                        FileSystem.open(val);
                    }
                }
            ]
        }, "search_files.");
    }

    close() {
        WINDOW = null;
        return super.close();
    }
}

let WINDOW: GoToFileWindow = null;
export default {
    show: () => {
        if(WINDOW === null) 
            WINDOW = new GoToFileWindow();
    }
}