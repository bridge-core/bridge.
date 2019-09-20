import { shell } from "electron";
import { WEB_APP_DATA } from "../scripts/constants";
import ContentWindow from "../scripts/commonWindows/Content";

export default class UpdateWindow extends ContentWindow {
    constructor(latest_version) {
        super({
            is_visible: true,
            options: {
                height: undefined,
                is_frameless: true,
                is_maximizable: false
            },
            actions: [
                {
                    text: "bridge.",
                    color: "grey"
                },
                {
                    type: "space"
                },
                {
                    type: "button",
                    text: "Later",
                    is_rounded: false,
                    action: () => {
                        this.close();
                    }
                },
                {
                    type: "button",
                    icon: "mdi-download",
                    text: "Download!",
                    is_rounded: false,
                    color: "success",
                    action: () => {
                        this.close();
                        shell.openExternal("https://github.com/solvedDev/bridge./releases/latest");
                    }
                }
            ]
        }, "update_app.");

        this.content = [
            {
                type: "header",
                text: "Update Available"
            },
            {
                type: "divider"
            },
            {
                type: "img",
                src: WEB_APP_DATA + "update_splash.png",
                height: "250px"
            },
            {
                type: "divider"
            },
            {
                text: `\n${latest_version} of bridge. is now available for download. Updates deliver new features for this editor and may include important bug fixes.\n\nPlease take the time to update bridge.!\n\n`
            }
        ];
        this.update({ content: this.content });
    }
}