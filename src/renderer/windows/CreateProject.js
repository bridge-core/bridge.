import fs from "fs";
import ContentWindow from "../scripts/commonWindows/Content";
import { BASE_PATH, RP_BASE_PATH } from "../scripts/constants";
import Vue from "../main";
import LoadingWindow from "./LoadingWindow";
import Manifest from "../scripts/utilities/Manifest";
import uuidv4 from "uuid/v4";

export default class CreateProjectWindow extends ContentWindow {
    constructor(create_bp=true, cb) {
        const DEFAULT_TEXT = `${create_bp ? "Projects" : "Resource packs"} are stored directly inside the "${create_bp ? "development_behavior_packs" : "development_resource_packs"}" folder.`;

        super({
            display_name: create_bp ? "New Project" : "New Resource Pack",
            options: {
                is_persistent: false,
                height: 260
            },
            actions: [
                {
                    type: "space"
                },
                {
                    type: "button",
                    text: "Create!",
                    color: "success",
                    is_rounded: true,
                    action: () => this.createProject(create_bp, cb)
                }
            ]
        });

        this.content = [
            {
                type: "input",
                key: uuidv4(),
                has_focus: true,
                text: `${create_bp ? "Project" : "Resource Pack"} Name`,
                color: "success",

                action: {
                    enter: () => {
                        this.createProject(create_bp, cb);
                    },
                    default: (val) => {
                        if(val == "") {
                            this.content[0].color = "error";
                            this.content[2].color = "error";
                            this.content[2].text = `Please enter a valid ${create_bp ? "project" : "resource pack"} name!`;
                            this.update({
                                content: this.content
                            });
                        } else {
                            this.content[0].color = "success";
                            this.content[2].color = "grey";
                            this.content[2].text = DEFAULT_TEXT;
                            this.update({
                                content: this.content
                            });
                        }
                        this.input = val;
                    }
                }
            },
            {
                type: "input",
                key: uuidv4(),
                text: `${create_bp ? "Project" : "Resource Pack"} Description`,
                color: "success",

                action: {
                    enter: () => {
                        this.createProject(create_bp, cb);
                    },
                    default: (val) => {
                        if(val == "") {
                            this.content[1].color = "error";
                            this.content[2].color = "error";
                            this.content[2].text = `Please enter a valid ${create_bp ? "project" : "resource pack"} description!`;
                            this.update({
                                content: this.content
                            });
                        } else {
                            this.content[1].color = "success";
                            this.content[2].color = "grey";
                            this.content[2].text = DEFAULT_TEXT;
                            this.update({
                                content: this.content
                            });
                        }
                        this.des = val;
                    }
                }
            },
            {
                text: DEFAULT_TEXT,
                color: "grey"
            },
            {
                type: "divider"
            },
            (create_bp ? {
                type: "switch",
                color: "success",
                text: "Register client data",
                action: (val) => {
                    this.client_data = val;
                }
            }: {})
        ];
        this.input = "";
        this.des = "";
        this.client_data = false;
        this.update({
            content: this.content
        });
    }

    createProject(create_bp, cb) {
        if(this.input == "" || this.des == "") {
            this.content[2].color = "error";
            this.content[2].text = `Please enter a valid ${create_bp ? "project" : "resource pack"} name and description!`;
            this.update({
                content: this.content
            });

            return;
        }
        this.close();
        let l_w = new LoadingWindow("project.").show();
        let b_path = create_bp ? BASE_PATH : RP_BASE_PATH;
        
        window.setTimeout(() => {
            fs.mkdir(b_path + this.input, (err) => {
                if(err && err.message.includes("already exists")) return l_w.hide();
                if(err) { l_w.hide(); throw err; }
                else fs.writeFile(b_path + this.input + "/manifest.json", new Manifest(create_bp ? "data" : "resources", this.input, this.des, this.client_data).get(), () => {
                    if(err && err.message.includes("already exists")) return l_w.hide();
                    if(err) { l_w.hide(); throw err; }
                    else Vue.$root.$emit("refreshExplorer");

                    l_w.hide();
                    if(typeof cb === "function") cb(this.input);
                });
            });
        }, 50);
    }
}