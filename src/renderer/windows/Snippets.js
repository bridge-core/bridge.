import ContentWindow from "../scripts/commonWindows/Content";
import fs from "fs";
import FileType from "../scripts/editor/FileType";
import TabSystem from "../scripts/TabSystem";
import JSONTree from "../scripts/editor/JsonTree";
import Store from "../store/index";

let SNIPPETS;
fs.readFile(__static + "/data/snippets.json", (err, data) => {
    if(err) throw err;
    SNIPPETS = JSON.parse(data.toString());
    
    if(Store.state.Settings.custom_snippets !== undefined) Store.state.Settings.custom_snippets.forEach(s => addSnippet(s));
});

function toArr() {
    let arr = [];
    let for_file = SNIPPETS[FileType.get()];
    if(for_file === undefined) return [];

    for(let key in for_file) {
        arr.push({
            value: key,
            text: for_file[key].display_name
        });
    }

    return arr;
}
function expandTemplateData(data, data_path) {
    let keys = data_path.split("/");
    let return_data = {};
    let current = return_data;

    for(let i = 0; i < keys.length; i++) {
        if(i === keys.length - 1) current[keys[i]] = data;
        else current[keys[i]] = {};

        current = current[keys[i]];
    }
    return return_data;
}
function addSnippet(s) {
    if(SNIPPETS[s.file_type] === undefined) SNIPPETS[s.file_type] = {};
    SNIPPETS[s.file_type][s.key] = s;
}
function removeSnippet(s) {
    delete SNIPPETS[s.file_type][s.key];
}

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

        this.snippet_list = toArr().sort((a, b) => a.text.localeCompare(b.text));
        this.content = [
            {
                type: "header",
                text: "Snippets"
            },
            {
                type: "divider"
            },
            {
                type: "autocomplete",
                text: "Search...",
                focus: true,
                options: this.snippet_list,
                action: (val) => {
                    console.log(val)
                    
                    let c = TabSystem.getSelected().content;
                    let templ = SNIPPETS[FileType.get()][val].template;
                    
                    if(c instanceof JSONTree) {
                        if(Store.state.Settings.snippet_scope === "Default" || templ.force_default_scope) {
                            c.get("global")
                                .buildFromObject(expandTemplateData(templ.data, templ.data_path), true, true, true);
                        } else {
                            TabSystem.getCurrentNavObj()
                                .buildFromObject(templ.data, true, true, true);
                        }
                        
                        TabSystem.setCurrentUnsaved();
                    }

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
}

let WIN;
export default {
    show: () => {
        if(SNIPPETS === undefined || toArr().length === 0) return;

        try {
            WIN.show();
        } catch(e) {
            WIN = new SnippetWindow();
        }
    },
    addSnippet,
    removeSnippet
}