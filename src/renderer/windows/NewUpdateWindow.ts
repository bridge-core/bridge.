import { newVersionRes } from "../scripts/Utilities/FetchLatestJson";
import { Marked } from "@ts-stack/markdown";
import { WEB_APP_DATA } from "../scripts/constants"
import ContentWindow from "../scripts/commonWindows/Content";
import updateApp from "../scripts/Utilities/updateApp";

export default class UpdateWindow extends ContentWindow {
      content: any;
      constructor(data: newVersionRes) {
            let { description, latest_version, downloads, latest_version_name, urls } = data;
            if (latest_version_name.indexOf('-') == -1) {
                  latest_version_name = latest_version.concat(" - Update Available");
            }
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
                              color: "primary",
                              action: () => {
                                    this.close();
                                    updateApp(urls);
                              }
                        }
                  ]
            }, "update_app.");

            this.content = [
                  {
                        type: "header",
                        text: latest_version_name
                        //text: `${latest_version} of bridge. is now available for download.`
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
                        type: "html-text",
                        text: `<br>${Marked.parse(description)}`
                  },
                  {
                        text: `\nDownloads: ${ downloads }\n\n`
                  }
            ];
            this.update({ content: this.content });
      }
}