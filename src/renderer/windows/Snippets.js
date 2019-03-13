import ContentWindow from "../scripts/commonWindows/Content";
import fs from "fs";
let SNIPPETS;
fs.readFile(__static + "/data/snippets.json", (err, data) => {
    if(err) throw err;
    SNIPPETS = data.toJSON();
    if(WIN) {
        WIN.content[2].type = "autocomplete";
        WIN.updateContent();
    } 
});

class SnippetWindow extends ContentWindow {
    constructor() {
        super({
            options: {
                is_visible: true,
                is_frameless: true,
                is_persistent: false,
                height: 150
            }
        }, "snippets.");

        this.snippet_list = [
            {
                text: "Hostile Snippet",
                value: "hostile_setup"
            },
            {
                text: "Passive Snippet",
                value: "passive_setup"
            },
            {
                text: "Send Event Snippet",
                value: "send_event_setup"
            },
            {
                text: "Marker Snippet",
                value: "marker_setup"
            },
            {
                text: "Trade Snippet",
                value: "trade_setup"
            }
        ].sort((a, b) => a.text.localeCompare(b.text));
        this.content = [
            {
                type: "header",
                text: "Snippets"
            },
            {
                type: "divider"
            },
            {
                type: SNIPPETS === undefined ? "loader" : "autocomplete",
                text: "Search...",
                focus: true,
                options: this.snippet_list,
                action: (val) => {
                    console.log(val)
                    this.close();
                }
            }
        ];
        

        this.updateContent();
    }

    updateContent() {
        this.update({
            content: this.content
        });
    }

    updateSnippets(update=true) {
        

        if(update) this.updateContent();
    }
}

let WIN;
export default {
    show: () => {
        try {
            WIN.show();
        } catch(e) {
            WIN = new SnippetWindow();
        }
    } 
}