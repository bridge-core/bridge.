import ContentWindow from "../../scripts/commonWindows/Content";
import Session, { getInfoMap } from "./Common";
import PluginCard from "./PluginCard";
import Title from "./Title";

export default class ListView extends ContentWindow {
    constructor(tag_filter) {
        super({
            display_name: tag_filter ? `Extensions | Filter: ${tag_filter}` : "Extensions",
            options: {
                is_persistent: false,
                blurs_background: false,
                elevation: 0
            },
            content: [
                {
                    type: "loader"
                }
            ]
        }, "bridge.plugin_store.");

        const BASE = [{ text: "\n" }];
        if(tag_filter) {
            BASE.push(...Title(tag_filter));
        }

        this.plugin_map = getInfoMap();
        Session.open()
            .then(data => {
                this.content = BASE
                    .concat(data.filter(({ tags }) => tag_filter ? tags.includes(tag_filter) : true)
                    .map(
                        (plugin) => ([
                            new PluginCard(this, plugin),
                            { text: "\n" }
                        ])
                    )
                    .flat(Infinity));

                if(this.content.length === 4) {
                    this.content = this.content.concat([ { text: `No matching results found for the filter "${tag_filter}"` } ])
                }

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