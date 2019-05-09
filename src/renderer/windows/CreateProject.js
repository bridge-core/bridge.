import fs from "fs";
import ContentWindow from "../scripts/commonWindows/Content";
import { BASE_PATH } from "../scripts/constants";
import Vue from "../main";
import LoadingWindow from "./LoadingWindow";
import Manifest from "../scripts/utilities/Manifest";


export default class CreateFileWindow extends ContentWindow {
    constructor() {
        const DEFAULT_TEXT = "Projects are stored directly inside the development_behavior_packs folder.";

        super({
            display_name: "New Project",
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
                    action: () => this.createProject()
                }
            ]
        });

        this.content = [
            {
                type: "input",
                text: "Project Name",
                color: "success",

                action: {
                    enter: () => {
                        this.createProject();
                    },
                    default: (val) => {
                        if(val == "") {
                            this.content[0].color = "error";
                            this.content[2].color = "error";
                            this.content[2].text = "Please enter a valid project name!";
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
                text: "Project Description",
                color: "success",

                action: {
                    enter: () => {
                        this.createProject();
                    },
                    default: (val) => {
                        if(val == "") {
                            this.content[1].color = "error";
                            this.content[2].color = "error";
                            this.content[2].text = "Please enter a valid project description!";
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
            {
                type: "switch",
                color: "success",
                text: "Register client data",
                action: (val) => {
                    this.client_data = val;
                }
            }
        ];
        this.input = "";
        this.des = "";
        this.client_data = false;
        this.update({
            content: this.content
        });
    }

    createProject() {
        if(this.input == "" || this.des == "") {
            this.content[2].color = "error";
            this.content[2].text = "Please enter a valid project name and description!";
            this.update({
                content: this.content
            });

            return;
        }
        this.close();
        let l_w = new LoadingWindow("project.").show();
        
        window.setTimeout(() => {
            fs.mkdir(BASE_PATH + this.input, (err) => {
                if(err && err.message.includes("already exists")) return l_w.hide();
                if(err) { l_w.hide(); throw err; }
                else fs.writeFile(BASE_PATH + this.input + "/manifest.json", new Manifest("data", this.input, this.des, this.client_data).get(), () => {
                    if(err && err.message.includes("already exists")) return l_w.hide();
                    if(err) { l_w.hide(); throw err; }
                    else Vue.$root.$emit("refreshExplorer");

                    l_w.hide();
                });
            });
        }, 50);
    }
}