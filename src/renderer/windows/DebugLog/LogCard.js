import ListView from "./ListView";
import { parseAffectedFiles } from "../../scripts/utilities/debugLog";
import { tag } from "./Common";

export default class LogCard {
    constructor(parent, { tags=[], error }, close_parent=true) {
        this.type = "card";
        this.above_content = tags.map(
                (t, i) => ({ 
                    type: "tag",
                    text: t.toUpperCase(),
                    ...tag(t),
                    action: () => {
                        if(close_parent) parent.close();
                        new ListView(t);
                    }
                })
            );
        this.content = [
            { type: "divider" },
            {
                text: `\n${error}\n\n`
            },
            { type: "divider" }
        ];

        this.below_content = [
            { type: "space" },
            {
                type: "button",
                icon: "mdi-magnify",
                text: "Open Files",
                color: "primary",
                action: () => {
                    parent.close();
                    parseAffectedFiles(error);
                }
            }
        ];
    }
}