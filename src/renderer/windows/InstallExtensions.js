import ContentWindow from "../scripts/commonWindows/Content";
import { WEB_APP_PLUGINS } from "../scripts/constants";
import { readJSONSync } from "../scripts/utilities/JsonFS";
import path from "path";
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

export default class InstallExtensions extends ContentWindow {
    constructor() {
        super({
            display_name: "Extensions",
            options: {
                is_persistent: false
            },
            content: [
                {
                    type: "loader"
                }
            ]
        }, "bridge.plugin_store.")

        fetch(WEB_APP_PLUGINS + "/plugins.json")
            .then(raw => raw.json())
            .then(data => {
                this.content = [{ text: "\n" }].concat(Object.entries(data).map(e => e.pop()).map(
                    ({ author, name, version, description, tags }) => ([
                        {
                            type: "card",
                            above_content: [
                                { text: `${name}` }
                            ],
                            content: [
                                { type: "divider" },
                                { 
                                    type: "container",
                                    display: "inline-block",
                                    no_wrap: true,
                                    small_scrollbar: true,
                                    content: [
                                        { type: "tag", text: version, icon: "mdi-code-braces", color: "primary" },
                                        { type: "tag", text: author, icon: "mdi-account", color: "success" },
                                        ...(tags || [ "Utility", "Verified", "Curated" ]).map(
                                            t => ({ type: "tag", text: t, color: (EXT_TAG_MAP[t] || {}).color, icon: (EXT_TAG_MAP[t] || {}).icon })
                                        )
                                    ].sort((a, b) => {
                                        if(a.icon && b.icon) return 0;
                                        else if(a.icon) return -1;
                                        if(b.icon) return 1;
                                    })
                                },
                                { text: `\n${description}\n\n` },
                                { type: "divider" }
                            ],
                            below_content: [
                                { type: "space" },
                                new DownloadButton(this, () => new Promise((resolve) => { setTimeout(() => resolve(), 1000) }))
                            ]
                        },
                        { text: "\n" }
                    ])
                ).flat(Infinity));

                this.update();
            })
    }

    set content(val) {
        this.win_def.content = val;
    }
    get content() {
        return this.win_def.content;
    }
}