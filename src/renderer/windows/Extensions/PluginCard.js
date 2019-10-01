import ListView from "./ListView";
import { tag, download, RELOAD_NOTIFICATION } from "./Common";

class DownloadButton {
    type = "button";
    icon = "mdi-download";
    text = "Download";
    color = "primary";
    constructor(parent, action, disabled) {
        this.is_disabled = disabled;
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

export default class PluginCard {
    constructor(parent, { author, name, version, description, tags, link }, close_parent=true) {
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
                                ...tag(t, i),
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
            new DownloadButton(this, () => download(link), link === undefined)
        ];

        this.update = () => {
            parent.update();
        }
    }
}