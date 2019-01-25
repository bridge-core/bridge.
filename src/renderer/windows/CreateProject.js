import fs from "fs";
import ContentWindow from "../scripts/commonWindows/Content";
import { BASE_PATH, MANIFEST_TEMPLATE } from "../scripts/constants";
import Vue from "../main";

export default class CreateFileWindow extends ContentWindow {
    constructor() {
        super({
            display_name: "New Project",
            options: {
                is_persistent: false,
                height: 160
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
                    text: "Create a new addon project. Projects are stored directly inside the development_behavior_packs folder!",
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
        fs.mkdir(BASE_PATH + this.input, (err) => {
            if(err && !err.message.includes("already exists")) throw err;
            else if(!err.message.includes("already exists")) fs.writeFile(BASE_PATH + this.input + "/manifest.json", MANIFEST_TEMPLATE, () => {
                if(err && !err.message.includes("already exists")) throw err;
                else if(!err.message.includes("already exists")) Vue.$root.$emit("refreshExplorer");
            });
        });
        
        
        this.close();
    }
}