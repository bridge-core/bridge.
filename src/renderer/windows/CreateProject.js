import fs from "fs";
import ContentWindow from "../scripts/commonWindows/Content";
import { BASE_PATH, MANIFEST_TEMPLATE } from "../scripts/constants";
import Vue from "../main";
import { S_IFBLK } from "constants";

export default class CreateFileWindow extends ContentWindow {
    constructor() {
        const DEFAULT_TEXT = "Projects are stored directly inside the development_behavior_packs folder.";

        super({
            display_name: "New Project",
            options: {
                is_persistent: false,
                height: 200
            },
            actions: [
                {
                    type: "space"
                },
                {
                    type: "button",
                    text: "Create!",
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
            }
        ];
        this.input = "";
        this.des = "";
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

        fs.mkdir(BASE_PATH + this.input, (err) => {
            if(err && err.includes("already exists")) return;
            if(err) throw err;
            else fs.writeFile(BASE_PATH + this.input + "/manifest.json", MANIFEST_TEMPLATE(this.input, this.des), () => {
                if(err && err.includes("already exists")) return;
                if(err) throw err;
                else Vue.$root.$emit("refreshExplorer");
            });
        });
        
        this.close();
    }
}