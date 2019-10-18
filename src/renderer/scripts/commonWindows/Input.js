import Store from "../../store/index";
import uuid from "uuid/v4";

export default class InputWindow {
    constructor({ header, text, label, expand_text }, onConfirm) {
        this.id = uuid();
        this.input = text;
        const CONFIRM_BTN = {
            type: "button",
            text: "Confirm",
            color: "primary",
            is_rounded: false,
            is_disabled: text === "",
            action: () => {
                this.close();
                if(typeof onConfirm == "function") onConfirm(this.input + (expand_text !== undefined ? expand_text : ""));
            }
        };
        const INPUT = {
            type: "input",

            text: label,
            input: text,
            has_focus: true,
            action: {
                enter: () => {
                    if(this.input === "") return;
                    this.close();
                    if(typeof onConfirm == "function") onConfirm(this.input + (expand_text !== undefined ? expand_text : ""));
                },
                default: (val) => {
                    if(val === "") {
                        this.input = val;
                        INPUT.input = val;
                        
                        CONFIRM_BTN.is_disabled = true;
                        this.update({ actions: this.actions, content: this.content });
                    } else if(this.input === "" && val !== "") {
                        this.input = val;
                        INPUT.input = val;

                        CONFIRM_BTN.is_disabled = false;
                        this.update({ actions: this.actions, content: this.content });
                    } else {
                        this.input = val;
                    }
                } 
            }   
        };

        this.actions = [
            {
                type: "space"
            },
            {
                type: "button",
                text: "Cancel",
                is_rounded: false,
                action: () => {
                    this.close();
                }
            },
            CONFIRM_BTN
        ];
        this.content = [
            {
                type: "header",
                text: header
            },
            {
                type: "divider"
            },
            {
                text: "\n"
            },
            {
                type: "horizontal",
                center: true,
                content: [
                    INPUT,
                    {
                        text: expand_text
                    }
                ]
            }
        ];
        
        Store.commit("addPluginWindow", { 
            actions: this.actions, 
            content: this.content,
            options: { 
                is_frameless: true, 
                height: 160,
                is_persistent: false
            },
            is_visible: true,
            id: this.id,
            onClose: () => this.close()
        });
    }

    update(opts) {
        Store.commit("updatePluginWindow", { ...opts, id: this.id });
        return this;
    }

    close() {
        Store.commit("removePluginWindow", this.id);
        return this;
    }
}