import fs from "fs";
import ContentWindow from "../scripts/commonWindows/Content";
import { RP_BASE_PATH } from "../scripts/constants";
import PackLinker from "../scripts/utilities/LinkPacks";

export default class LinkRPWindow extends ContentWindow {
    private selected_rp: string;

    constructor(bp_name: string) {
        const PROJECTS = fs.readdirSync(RP_BASE_PATH);

        super({
            display_name: "Link Project To Resource Pack",
            options: {
                is_persistent: false,
                height: 170
            },
            content: [
                {
                    text: "Create a link between the currently selected behavior pack and one of your resource packs.\n\n"
                },
                {
                    type: "select",
                    input: PROJECTS[0],
                    color: "primary",
                    options: PROJECTS,
    
                    action: (val: string) => {
                        this.selected_rp = val;
                    }   
                }
            ],
            actions: [
                {
                    type: "space"
                },
                {
                    type: "button",
                    text: "Link!",
                    color: "primary",
                    is_rounded: false,
                    action: () => {
                        this.close();
                        setTimeout(() => PackLinker.link(bp_name, this.selected_rp), 300);
                    }
                }
            ]
        });

        this.selected_rp = PROJECTS[0];
    }
}