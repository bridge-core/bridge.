import FileSystem from "../scripts/FileSystem";
import ContentWindow from "../scripts/commonWindows/Content";
import Store from "../store/index";
import Runtime from "../scripts/plugins/Runtime";
import { FILE_TEMPLATES } from "../scripts/constants";
import FileType from "../scripts/editor/FileType";

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

                                this.path_info.text = "Invalid file name!\n\n"
                                this.path_info.color = "error";

                                this.update_function({ content: this.content, actions: this.parent.actions });
                            } else {
                                this.input.content[0].input = val;
                                this.input.content[0].color = "success";

                                this.path_info.text = this.getPath(val) + "\n\n";
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
            text: this.getPath("unnamed", ext) + "\n\n",
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
        return `${Store.state.Explorer.project.explorer}/${expand}${val}.${ext}`;
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
        const plugin_types = Runtime.CreationWindow.get();
        const FILE_DATA = FileType.getFileCreator();

        super({
            display_name: "New File",
            options: {
                is_persistent: false
            },
            sidebar: FILE_DATA.map(({ icon, title }, index) => {
                return {
                    icon,
                    title,
                    opacity: 0.25,
                    action: () => {
                        this.select(index)
                    }
                }
            }).concat([{
                icon: "mdi-language-javascript",
                title: "Script",
                opacity: 0.25,
                action: () => {
                    this.select(FILE_DATA.length)
                }
            }])
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
            FileSystem.save(this.current_content.getPath(), this.chosen_template, true, true);
            this.close();
        };
        this.actions = [
            {
                type: "space"
            },
            {
                type: "button",
                text: "Create!",
                color: "success",
                is_rounded: true,
                is_disabled: false,
                action: this.createFile
            }
        ];
        this.win_def.actions = this.actions;
        this.contents = [
            ...FILE_DATA.map(({ title, extension, path }) => new FileContent(title, extension, this, path)),
            this.SCRIPTS
        ];
        this.templates = FILE_DATA.map(f => f.templates).concat(FILE_TEMPLATES);
        this.chosen_template = "";

        plugin_types.forEach(t => this.loadPluginType(t.sidebar_element, t.templates, t.options));
        this.select(0);
    }

    select(id) {
        this.current_content = this.contents[id];

        this.win_def.sidebar.forEach(e => e.opacity = 0.25);
        this.win_def.sidebar[id].opacity = 1;
        this.win_def.content = this.contents[id].get() || [ { text: "Nothing to show yet" } ];

        if(this.templates[id] && !this.win_def.content.added_select) this.compileTemplate(this.templates[id]);

        this.update();
    }

    compileTemplate(templ) {
        this.win_def.content.added_select = true;
        this.win_def.content.push({
            type: "header",
            text: "Templates"
        },
        {
            type: "divider"
        },
        {
            type: "select",
            options: ["No template"].concat(Object.keys(templ)),
            text: "Select template",
            action: (val) => {
                if(templ[val] == undefined) this.chosen_template = "";
                if(typeof templ[val] == "string") this.chosen_template = templ[val];
                else this.chosen_template = JSON.stringify(templ[val], null, "\t");
            }
        });
    }

    loadPluginType(add_sidebar, add_templates, opts) {
        let sidebar = this.win_def.sidebar;
        let id = sidebar.length;
        sidebar[id] = ({
            ...add_sidebar,
            action: () => {
                (function() {
                    this.select(id);
                }).call(this)
            }
        });

        if(add_templates) {
            this.templates[id] = {};
            add_templates.forEach(t => {
                this.templates[id][t.display_name] = t.content;
            });
        }

        this.contents[id] = new FileContent(opts.display_name, opts.extension, this, opts.path);
    }
}