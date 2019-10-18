import ContentWindow from "../../scripts/commonWindows/Content";
import Session, { getInfoMap } from "./Common";
import PluginCard from "./PluginCard";
import Category from "./Category";
import ListView from "./ListView";
import Title from "./Title";
import { shell } from "electron";

export default class Browser extends ContentWindow {
    constructor() {
        const DEFAULT_CONTENT = [
            new Category("Verified", () => { new ListView("Verified") }),
            { type: "divider" },
            new Category("Utility", () => { new ListView("Utility") }),
            { type: "divider" },
            new Category("Component", () => { new ListView("Component") }),
            { type: "divider" },
            new Category("Snippet", () => { new ListView("Snippet") }),
            { type: "divider" },
            new Category("Theme", () => { new ListView("Theme") }),
            { type: "divider" },
            new Category("View All", () => { new ListView() }),
            { type: "divider" },
            { text: "\n\n" },
            ...Title("Curated")
        ];
        const APPEND_CONTENT = [
            { text: "\n" },
            ...Title("Submissions"),
            {
                text: `Share your plugins with all bridge. users by adding them to the "bridge-plugins" repository.\n\n`
            },
            {
                type: "card",
                elevation: 0,
                below_content: [
                    {
                        type: "space"
                    },
                    {
                        type: "button",
                        color: "primary",
                        text: "Visit",
                        icon: "mdi-open-in-new",
                        action: () => shell.openExternal("https://github.com/solvedDev/bridge-plugins")
                    }
                ]
            },
            { text: "\n" }
        ]
        
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
                ).concat(APPEND_CONTENT).flat(Infinity));

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