import TabWindow from "../scripts/commonWindows/TabWindow";
import { shell } from "electron";
import { APP_VERSION } from "../scripts/constants";

class Creator {
    constructor(content, creator, links) {
        this.type = "container";
        this.content = [
            {
                type: "header",
                text: `\n${content}: ${creator}`
            },
            ...links.map(({ link, ...other }) => {
                return {
                    type: "icon-button",
                    is_flat: true,
                    ...other,
                    action: () => {
                        shell.openExternal(link)
                    }
                }
            })
        ]
    }
}
class Link {
    constructor(content, link_name, link) {
        this.type = "container";
        this.content = [
            {
                text: `${content}${content ? " " : ""}`
            },
            {
                color: "grey",
                text: link_name,
                action: () => shell.openExternal(link)
            }
        ]
    }
}

export default class CreditsWindow extends TabWindow {
    constructor() {     
        super("About", { is_persistent: false }, "bridge.core.credits_window.");

        this.addTab({
            sidebar_element: {
                icon: "mdi-code-braces",
                title: "General"
            },
            content: [
                {
                    type: "header",
                    text: `\nYou are running bridge. ${APP_VERSION}\n\n`
                },
                {
                    type: "divider"
                },
                new Creator("Developer", "solvedDev", [{
                    color: "info",
                    text: "mdi-twitter",
                    link: "https://twitter.com/solvedDev"
                },
                {
                    text: "mdi-github-circle",
                    link: "https://github.com/solvedDev"
                }]),
                {
                    type: "divider"
                }
            ]
        });
        this.addTab({
            sidebar_element: {
                icon: "mdi-file-image",
                title: "Assets"
            },
            content: [
                new Creator("Logo", "Matteo Simonetti", [{
                    color: "info",
                    text: "mdi-twitter",
                    link: "https://twitter.com/lKanno_"
                }]),
                {
                    type: "divider"
                }
            ]
        });
        this.addTab({
            sidebar_element: {
                icon: "mdi-open-in-new",
                title: "Links"
            },
            content: [
                new Link("bridge. README: ", "GitHub", "https://github.com/solvedDev/bridge./"),
                new Link("Bedrock ", "Documentation", "https://bedrock.dev/"),
                new Link("", "Vanilla Behavior Pack", "https://aka.ms/MinecraftBetaBehaviors/")
            ]
        });

        this.update();
    }
}