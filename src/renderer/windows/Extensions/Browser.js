import ContentWindow from "../../scripts/commonWindows/Content";
import Session, { getInfoMap } from "./Common";
import PluginCard from "./PluginCard";
import Category from "./Category";
import ListView from "./ListView";
import Title from "./Title";

export default class Browser extends ContentWindow {
    constructor() {
        const DEFAULT_CONTENT = [
            new Category("Verified", () => { new ListView("Verified") }),
            { type: "divider" },
            new Category("Theme", () => { new ListView("Theme") }),
            { type: "divider" },
            new Category("Utility", () => { new ListView("Utility") }),
            { type: "divider" },
            new Category("Snippet", () => { new ListView("Snippet") }),
            { type: "divider" },
            new Category("View All", () => { new ListView() }),
            { type: "divider" },
            { text: "\n\n" },
            ...Title("Curated")
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

        this.plugin_map = getInfoMap();
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