import { readJSONSync } from "../../scripts/utilities/JsonFS";
import path from "path";
import ListView from "./ListView";
const EXT_TAG_MAP = readJSONSync(path.join(__static, "data/ext_tag_map.json"));

class DownloadButton {
    type = "button";
    icon = "mdi-download";
    text = "Download";
    color = "primary";
    constructor(parent, action) {
        this.action = async () => {
            console.log(this);
            this.is_loading = true;
            parent.update();
            if(typeof action === "function") await action();
            this.is_loading = false;
            parent.update();
        };
    }
}

function tag(tag_name, index) {
    return  (EXT_TAG_MAP[tag_name] || EXT_TAG_MAP[`${index}`] || {});
}

export default class PluginCard {
    constructor(parent, { author, name, version, description, tags }, close_parent=true) {
        this.type = "card";
        this.above_content = [
            { text: `${name}` }
        ];
        this.content = [
            { type: "divider" },
            { 
                type: "container",
                display: "inline-block",
                no_wrap: true,
                small_scrollbar: true,
                content: [
                    ...(tags || [])
                        .map(
                            (t, i) => ({ 
                                type: "tag",
                                text: t,
                                color: tag(t, i).color,
                                icon: tag(t, i).icon,
                                action: () => {
                                    if(close_parent) parent.close();
                                    new ListView(t);
                                }
                            })
                        )
                ].sort((a, b) => {
                    if(a.icon && b.icon) return 0;
                    else if(a.icon) return -1;
                    if(b.icon) return 1;
                })
            },
            { text: `\n${description}\n\n` },
            { type: "divider" }
        ];
        this.below_content = [
            { type: "space" },
            new DownloadButton(this, () => new Promise((resolve) => { setTimeout(() => resolve(), 1000) }))
        ];

        this.update = () => {
            parent.update();
        }
    }
}