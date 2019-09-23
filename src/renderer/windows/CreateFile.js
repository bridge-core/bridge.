import FileSystem from "../scripts/FileSystem";
import ContentWindow from "../scripts/commonWindows/Content";
import Store from "../store/index";
import FileType from "../scripts/editor/FileType";
import safeEval from "safe-eval";
import { RP_BASE_PATH, BASE_PATH } from "../scripts/constants";
import uuidv4 from "uuid/v4";
import { walkSync } from "../scripts/autoCompletions/Dynamic";
import { join } from "path";
import { promises as fs } from "fs";

class FileContent {
    constructor(name, ext="json", parent, expand_path="", { location, ...add_content }={}, use_rp_path) {
        this.parent = parent;
        this.ext = ext;
        this.expand_path = expand_path;
        this.use_rp_path = use_rp_path;
        this.curr_input = "unnamed";

        this.input = {
            type: "horizontal",
            center: true,
            key: uuidv4(),
            content: [
                {
                    type: "input",
                    text: "Name",
                    input: this.curr_input,
                    has_focus: true,
                    color: "success",
                    key: uuidv4(),
                    action: {
                        enter: () => {
                            if(this.curr_input !== "") this.parent.createFile();
                        },
                        default: (val) => {
                            this.curr_input = val;

                            if(val === "" && !this.parent.actions[1].is_disabled) {
                                this.input.content[0].color = "error";
                                this.input.content[0].key = uuidv4();
                                this.input.content[0].input = this.curr_input;
                                this.parent.actions[1].is_disabled = true;

                                // this.path_info.text = "Invalid file name!\n\n"
                                // this.path_info.color = "error";

                                this.parent.update({ content: this.content, actions: this.parent.actions });
                            } else if(this.parent.actions[1].is_disabled) {
                                this.input.content[0].color = "success";
                                this.input.content[0].key = uuidv4();
                                this.input.content[0].input = this.curr_input;
                                this.parent.actions[1].is_disabled = false;

                                // this.path_info.text = this.getPath(val) + "\n\n";
                                // this.path_info.color = "grey";

                                this.parent.update({ content: this.content, actions: this.parent.actions });
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
        this.path_info = () => {
            return {
                text: this.getPath("[File Name]", ext) + "\n\n",
                color: "grey"
            };
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

        if(location === undefined)
            location = {};
        if(add_content !== undefined)
            this.add({
                ...add_content,
                action: (parameter) => {
                    if(add_content.action !== undefined && add_content.action.type === "change_path") {
                        this.expand_path = safeEval(add_content.action.to, { parameter });
                        this.path_info.text = this.getPath(undefined, undefined);
                        this.parent.update({ content: this.content });
                    } else if(add_content.action !== undefined) {
                        throw new Error("Unknown add_content.action type: " + add_content.action.type);
                    }
                }
            }, ...location);
    }

    getPath(val=this.curr_input, ext=this.ext, expand=this.expand_path) {
        return `${this.use_rp_path ? Store.state.Explorer.project.resource_pack : Store.state.Explorer.project.explorer}/${expand}${val}.${ext}`;
    }

    getFullPath(val, ext, expand) {
        return `${this.use_rp_path ? RP_BASE_PATH : BASE_PATH}${this.getPath(val, ext, expand)}`;
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
    constructor(show_rp=false, apply_filter=true) {
        let FILE_DATA;
        if(apply_filter || Store.state.Explorer.project.resource_pack === undefined)
            FILE_DATA = FileType.getFileCreator()
                .filter(f => show_rp ? f.rp_definition : !f.rp_definition)
                .sort(({title: t1}, {title: t2}) => t1.localeCompare(t2));
        else 
            FILE_DATA = FileType.getFileCreator()
                .sort(({title: t1}, {title: t2}) => t1.localeCompare(t2));

        super({
            display_name: "New File",
            options: {
                is_visible: false,
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
            })
        });

        this.createFile = () => {
            FileSystem.save(
                this.current_content.getFullPath(), 
                this.chosen_template, 
                true, 
                true
            );
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
                is_rounded: false,
                is_disabled: false,
                action: this.createFile
            }
        ];
        this.win_def.actions = this.actions;
        this.contents = FILE_DATA.map(({ title, extension, path, add_content, rp_definition }) => new FileContent(title, extension, this, path, add_content, rp_definition));
        //Templates
        this.templates = FILE_DATA.map(({ templates, rp_definition }) => {
            return {
                ...templates,
                rp_definition
            }
        });
        this.chosen_template = "";

        this.select(0);
    }

    async select(id) {
        this.current_content = this.contents[id];

        this.win_def.sidebar.forEach(e => { e.opacity = 0.25; e.is_selected = false; });
        this.win_def.sidebar[id].opacity = 1;
        this.win_def.sidebar[id].is_selected = true;
        this.win_def.options.is_visible = true;
        this.win_def.content = this.contents[id].get() || [ { text: "Nothing to show yet" } ];

        if(this.templates[id] && !this.win_def.content.added_select) await this.compileTemplate(this.templates[id]);
        this.update();
    }

    async compileTemplate(templ) {
        const { $default_pack, rp_definition, ...templates } = templ;
        if($default_pack !== undefined) {
            let arr;
            let p = join(__static, "vanilla", $default_pack.path);
  
            if($default_pack.deep) arr = walkSync(p, true);
            else arr = await fs.readdir(p);

            arr.forEach(f => {
                templates[f] = async () => (await fs.readFile(join(p, f))).toString();
            });
        }
        let options = ["No template"].concat(Object.keys(templates));
        

        this.win_def.content.push({
            type: "header",
            text: "Templates"
        },
        {
            type: "divider"
        },
        {
            type: options.length <= 6 ? "select" : "autocomplete",
            is_box: true,
            options,
            text: "Select template",
            action: async (val) => {
                if(templates[val] === undefined) this.chosen_template = "";
                else if(typeof templates[val] === "function") this.chosen_template = await templates[val]();
                else if(typeof templates[val] === "string") this.chosen_template = templates[val];
                else this.chosen_template = JSON.stringify(templates[val], null, "\t");
            }
        });
        this.win_def.content.added_select = true;
    }
}