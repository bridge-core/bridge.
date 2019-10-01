import ContentWindow from "../../scripts/commonWindows/Content";
import Session from "./Session";
import PluginCard from "./PluginCard";
import Category from "./Category";
import ListView from "./ListView";

export default class Browser extends ContentWindow {
    constructor() {
        const DEFAULT_CONTENT = [
            new Category("Verified", () => { new ListView("Verified") }),
            new Category("View All", () => { new ListView() }),
        ];

        super({
            display_name: "Extensions",
            options: {
                is_persistent: false
            },
            content: [
                ...DEFAULT_CONTENT,
                {
                    type: "loader"
                }
            ],
            onClose: () => {
                this.close();
                Session.close();
            }
        }, "bridge.plugin_store.");

        Session.open()
            .then(data => {
                this.content = [{ text: "\n" }, ...DEFAULT_CONTENT].concat(data.filter(({ tags }) => tags && tags.includes("Curated")).map(
                    (plugin) => ([
                        new PluginCard(this, plugin, false),
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