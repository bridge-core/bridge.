import ContentWindow from "../scripts/commonWindows/Content";
import FileType from "../scripts/editor/FileType";
import TabSystem from "../scripts/TabSystem";
import JSONTree from "../scripts/editor/JsonTree";
import Store from "../store/index";
import EventBus from "../scripts/EventBus";
import InformationWindow from "../scripts/commonWindows/Information";

let SNIPPETS: any; 

async function assureLoadedSnippets() {
    if(SNIPPETS === undefined)
        SNIPPETS = await FileType.getSnippets();
}

async function convArr() {
    await assureLoadedSnippets();

    let snippets: any[] = SNIPPETS[FileType.get()];
    if(snippets === undefined) return [];
    return snippets.map((s, i) => (s.is_hidden ? undefined : { value: i, text: s.display_name })).filter(s => s !== undefined);
}
async function addSnippet(s: any) {
    await assureLoadedSnippets();

    if(SNIPPETS[s.file_type] === undefined) SNIPPETS[s.file_type] = [];
    SNIPPETS[s.file_type].push(s);
}
async function removeSnippet(s: any) {
    await assureLoadedSnippets();

    SNIPPETS[s.file_type].splice(SNIPPETS[s.file_type].indexOf(s.id), 1);
}
async function insertSnippet(snippet_name: string, force_default_scope=false) {
    let c = TabSystem.getSelected().content;
    let templ = SNIPPETS[FileType.get()][snippet_name].template;

    if(c instanceof JSONTree) {
        if(Store.state.Settings.snippet_scope === "Default" || templ.force_default_scope || force_default_scope) {
            c.get("global")
                .buildFromObject(expandTemplateData(templ.data, templ.data_path), true, true, true);
        } else {
            TabSystem.getCurrentNavObj()
                .buildFromObject(templ.data, true, true, true);
        }
        
        TabSystem.setCurrentUnsaved();
    } else {
        EventBus.trigger("setCMSelection", String(templ.data));
    }
}

function expandTemplateData(data: any, data_path="") {
    let keys = data_path.split("/");
    let return_data = {};
    let current: any = return_data;

    for(let i = 0; i < keys.length; i++) {
        if(i === keys.length - 1) current[keys[i]] = data;
        else current[keys[i]] = {};

        current = current[keys[i]];
    }
    return return_data;
}

class SnippetWindow extends ContentWindow {
    private content: any[];
    constructor() {
        super({
            options: {
                is_visible: true,
                is_frameless: true,
                is_persistent: false,
                height: 150
            }
        }, "snippets.");

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
                has_focus: true,

                action: (val: string) => {
                    insertSnippet(val, false);
                    this.close();
                }
            }
        ];

        this.showWin();
    }
    close() {
        super.close();
        WINDOW = undefined;
        return this;
    }

    updateContent() {
        this.update({
            content: this.content
        });
    }
    async showWin() {
        this.content[2].options = (await convArr()).sort((a, b) => a.text.localeCompare(b.text));
        this.updateContent();
        this.show();
    }
}

export class PluginSnippets {
    static add(s: any) {
        addSnippet({
            ...s,
            is_plugin: true
        });
    }
    static removeAll() {
        for(let type in SNIPPETS) {
            SNIPPETS[type] = SNIPPETS[type].filter((s: any) => !s.is_plugin);
        }
    }
}

let WINDOW: any;
export default {
    show: async () => {
        await assureLoadedSnippets();
        // console.log(SNIPPETS);

        let type = FileType.get();
        if(SNIPPETS === undefined || SNIPPETS[type] === undefined || SNIPPETS[type].length === 0) {
            if(TabSystem.getSelected())
                return new InformationWindow("ERROR", "No snippets available for the currently opened file.", false);
            else 
                return new InformationWindow("ERROR", "You have to open a file to use snippets.", false);
        }
            

        try {
            WINDOW.showWin();
        } catch(e) {
            WINDOW = new SnippetWindow();
        }
    },
    addSnippet,
    removeSnippet,
    insert: insertSnippet
}