import fs from "fs";
import ContentWindow from "../scripts/commonWindows/Content";
import { BASE_PATH, MANIFEST_TEMPLATE } from "../scripts/constants";
import Vue from "../main";
import { S_IFBLK } from "constants";

export default class CreateFileWindow extends ContentWindow {
    constructor() {
        super({
            display_name: "New Project",
            options: {
                is_persistent: false,
                height: 200
            },
            content: [
                {
                    type: "input",
                    text: "Project Name",
                    action: {
                        enter: () => {
                            this.createProject();
                        },
                        default: (val) => {
                            this.input = val;
                        }
                    }
                },
                {
                    type: "input",
                    text: "Project Description",
                    action: {
                        enter: () => {
                            this.createProject();
                        },
                        default: (val) => {
                            this.des = val;
                        }
                    }
                },
                {
                    text: "Projects are stored directly inside the development_behavior_packs folder.",
                    color: "grey"
                }
            ],
            actions: [
                {
                    type: "space"
                },
                {
                    type: "button",
                    text: "Create!",
                    action: () => this.createProject
                }
            ]
        });
    }

    createProject() {
        if(this.input == "") return;

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