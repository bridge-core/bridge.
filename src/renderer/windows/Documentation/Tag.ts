import ContentWindow from "../../scripts/commonWindows/Content";
import { loadTags, resetTagCache } from "../../scripts/documentation/TagLoader";
import CommonCard from "../common/Card";

const PAGE_SIZE = 30;

export default class TagDocumentation extends ContentWindow {
    constructor(from=0, load_new=true) {
        super({
            display_name: "Tag Documentation",
            options: {
                is_maximizable: false,
                is_persistent: false
            },
            content: [
                {
                    type: "loader"
                }
            ],
            onClose: () => {
                this.close();
            }
        }, "bridge.plugin_store.");

        if(load_new)
        resetTagCache();
        loadTags()
            .then(tags => {
                // console.log(tags);
                this.content = [{ text: "\n" }];
                this.content.push(...tags.slice(from, from + PAGE_SIZE).map(
                    ({ id, description, events }) => [
                        new CommonCard(this, { title: id, description, categories: Object.keys(events) }),
                        { text: "\n" }
                    ]
                ).flat());

                this.actions = [
                    { type: "space" },
                    {
                        text: `${ (from / PAGE_SIZE) + 1 }/${ Math.ceil(tags.length / PAGE_SIZE) }`
                    },
                    {
                        type: "icon-button",
                        text: "mdi-chevron-left",
                        only_icon: true,
                        is_disabled: from === 0,
                        action: () => {
                            this.close();
                            new TagDocumentation(from - PAGE_SIZE, false);
                        }
                    },
                    {
                        type: "icon-button",
                        text: "mdi-chevron-right",
                        only_icon: true,
                        is_disabled: from + PAGE_SIZE > tags.length,
                        action: () => {
                            this.close();
                            new TagDocumentation(from + PAGE_SIZE, false);
                        }
                    }
                ];

                this.update();
            })
    }

    set content(val) {
        this.win_def.content = val;
    }
    get content(): any[] {
        return this.win_def.content;
    }
    set actions(val) {
        this.win_def.actions = val;
    }
    get actions(): any[] {
        return this.win_def.actions;
    }
}