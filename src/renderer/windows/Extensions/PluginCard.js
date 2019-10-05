import ListView from "./ListView";
import Session, { tag, download, RELOAD_NOTIFICATION, isInstalled } from "./Common";
import { greaterThan } from "../../scripts/VersionUtils";

class DownloadButton {
    type = "button";
    icon = "mdi-download";
    text = "Download";
    color = "primary";
    constructor(parent, action, disabled, is_installed, is_update) {
        this.is_disabled = disabled;

        if(is_update) {
            this.setUpdateAvailable();
        } else if(is_installed) {
           this.setInstalled();
        }

        this.action = async () => {
            this.is_loading = true;
            parent.update();
            if(typeof action === "function") await action();
            this.is_loading = false;
            this.setInstalled();
            parent.update();
        };
    }

    setUpdateAvailable() {
        this.is_disabled = false;
        this.color = "success";
        this.text = "Update";
        this.icon = "mdi-update";
    }
    setInstalled() {
        this.is_disabled = true;
        this.text = "Installed";
        this.icon = "mdi-check";
        this.color = "primary";
    }
}

export default class PluginCard {
    constructor(parent, { author, name, version, description, tags, link, id }, close_parent=true) {
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
            new DownloadButton(
                this,
                async () => {
                    await download(link);
                    Session.setSessionInstalled(id, version);
                },
                link === undefined,
                parent.plugin_map[id] !== undefined,
                greaterThan(version, parent.plugin_map[id] || version)
            )
        ];

        this.update = () => {
            parent.update();
        }
    }
}