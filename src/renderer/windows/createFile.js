import FileSystem from "../scripts/FileSystem";
import ContentWindow from "../scripts/commonWindows/Content";
import Store from "../store/index";

class FileContent {
    constructor(name, ext="json", parent, expand_path="") {
        this.parent = parent;
        this.update_function = parent.update;
        this.ext = ext;
        this.expand_path = expand_path;

        this.input = {
            type: "horizontal",
            center: true,
            content: [
                {
                    type: "input",
                    text: "Name",
                    input: "unnamed",
                    focus: true,
                    color: "success",
                    action: {
                        enter: () => {
                            this.parent.createFile();
                        },
                        default: (val) => {
                            if(val == "") {
                                this.input.content[0].color = "error";
                                this.parent.actions[1].is_disabled = true;

                                this.path_info.text = "Invalid file name!"
                                this.path_info.color = "error";

                                this.update_function({ content: this.content, actions: this.parent.actions });
                            } else {
                                this.input.content[0].input = val;
                                this.input.content[0].color = "success";

                                this.path_info.text = this.getPath(val);
                                this.path_info.color = "grey";

                                this.parent.win_def.actions[1].is_disabled = false;
                                this.update_function({ content: this.content, actions: this.parent.win_def.actions });
                            }
                        }
                    }
                },
                {
                    text: `.${ext}`,
                    color: "grey"
                }
            ]
        };
        this.path_info = {
            text: this.getPath("unnamed", ext),
            color: "grey"
        };

        this.content = [
            {
                type: "header",
                text: name
            },
            {
                type: "divider"
            },
            {
                text: "\n"
            },
            this.input,
            this.path_info
        ];
    }

    getPath(val=this.input.content[0].input, ext=this.ext, expand=this.expand_path) {
        return `${Store.state.Explorer.project}/${expand}${val}.${ext}`;
    }

    get() {
        return this.content;
    }

    add(c, i=this.content.length, r=0) {
        this.content.splice(i, r, c);
        return this;
    }
}

export default class CreateFileWindow extends ContentWindow {
    constructor() {
        super({
            display_name: "New file",
            sidebar: [
                {
                    icon: "mdi-chess-knight",
                    title: "Entity",
                    opacity: 0.25,
                    action: () => {
                        this.select(0)
                    }
                },
                {
                    icon: "store",
                    title: "Trade Table",
                    opacity: 0.25,
                    action: () => {
                        this.select(1)
                    }
                },
                {
                    icon: "mdi-skull",
                    title: "Loot Table",
                    opacity: 0.25,
                    action: () => {
                        this.select(2)
                    }
                },
                {
                    icon: "mdi-function",
                    title: "Function",
                    opacity: 0.25,
                    action: () => {
                        this.select(3)
                    }
                },
                {
                    icon: "mdi-format-list-checks",
                    title: "Spawn Rule",
                    opacity: 0.25,
                    action: () => {
                        this.select(4)
                    }
                },
                {
                    icon: "mdi-language-javascript",
                    title: "Script",
                    opacity: 0.25,
                    action: () => {
                        this.select(5)
                    }
                }
            ]
        });
        this.SCRIPTS = new FileContent("Script", "js", this, "scripts/server/").add({
            type: "select",
            text: "server",
            options: [ "server",  "client" ],
            action: (val) => {
                this.SCRIPTS.expand_path = "scripts/" + val + "/";
                this.SCRIPTS.path_info.text = this.SCRIPTS.getPath(undefined, undefined)
                this.update({ content: this.SCRIPTS.content });
            }
        }, -3, 1);

        this.createFile = () => {
            FileSystem.save(this.current_content.getPath(), "");
            this.close();
        };
        this.actions = [
            {
                type: "space"
            },
            {
                type: "button",
                text: "Create!",
                is_rounded: true,
                is_disabled: false,
                action: this.createFile
            }
        ];
        this.win_def.actions = this.actions;
        this.contents = [
            new FileContent("Entity", undefined, this, "entities/"),
            new FileContent("Trade Table", undefined, this, "trading/"),
            new FileContent("Loot Table", undefined, this, "loot_tables/"),
            new FileContent("Function", "mcfunction", this, "functions/"),
            new FileContent("Spawn Rule", undefined, this, "spawn_rules/"),
            this.SCRIPTS
        ];
        this.select(0);
    }

    select(id) {
        this.current_content = this.contents[id];

        this.win_def.sidebar.forEach(e => e.opacity = 0.25);
        this.win_def.sidebar[id].opacity = 1;
        this.win_def.content = this.contents[id].get() || [ { text: "Nothing to show yet" } ];
        this.update();
    }
}