import { shell } from "electron";
import { WEB_APP_DATA, APP_VERSION } from "../scripts/constants";
import ContentWindow from "../scripts/commonWindows/Content";

export default class UpdateWindow extends ContentWindow {
    constructor() {
        super({
            is_visible: false,
            options: {
                height: 300,
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
                    is_rounded: true,
                    action: () => {
                        this.close();
                    }
                },
                {
                    type: "button",
                    text: "Download now!",
                    is_rounded: true,
                    color: "success",
                    action: () => {
                        this.close();
                        shell.openExternal("https://github.com/solvedDev/bridge./releases");
                    }
                }
            ]
        }, "update_app.");

        fetch(WEB_APP_DATA + "app.json")
            .then(data => data.json())
            .then(web_data => {
                if(APP_VERSION != web_data.latest_version) {
                    this.content[2].text = `\n${web_data.latest_version} of bridge. is now available for download. Updates deliver new features for this editor and may include important bug fixes.\n\nPlease take the time to update bridge.!\n\n`;
                    this.update({ is_visible: true, content: this.content });
                }
            })
            .catch(err => console.log(err));

        this.content = [
            {
                type: "header",
                text: "Update available"
            },
            {
                type: "divider"
            },
            {
                text: ""
            }
        ];
        this.update({ content: this.content })
    }
}