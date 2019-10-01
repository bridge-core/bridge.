import ContentWindow from "../../scripts/commonWindows/Content";
import Session from "./Session";
import PluginCard from "./PluginCard";

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
        }, "bridge.plugin_store.")

        Session.open()
            .then(data => {
                this.content = [{ text: "\n" }]
                    .concat(data.filter(({ tags }) => tag_filter ? tags.includes(tag_filter) : true)
                    .map(
                        (plugin) => ([
                            new PluginCard(this, plugin),
                            { text: "\n" }
                        ])
                    )
                    .flat(Infinity));

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