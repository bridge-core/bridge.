import Store from "../../store/index";

export default class InputWindow {
    constructor({ header, text, label, expand_text }, onConfirm) {
        this.id = `main.core.windows.confirm_window.${Math.random()}`;
        this.input = text;
        this.actions = [
            {
                type: "space"
            },
            {
                type: "button",
                text: "Cancel",
                is_rounded: true,
                action: () => {
                    this.close();
                }
            },
            {
                type: "button",
                text: "Confirm",
                color: "success",
                is_rounded: true,
                action: () => {
                    this.close();
                    if(typeof onConfirm == "function") onConfirm(this.input + (expand_text !== undefined ? expand_text : ""));
                }
            }
        ];
        
        Store.commit("addPluginWindow", { 
            actions: this.actions, 
            content: [
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
                        {
                            type: "input",
                            text: label,
                            input: text,
                            has_focus: true,
                            action: {
                                enter: () => {
                                    this.close();
                                    if(typeof onConfirm == "function") onConfirm(this.input + (expand_text !== undefined ? expand_text : ""));
                                },
                                default: (val) => {
                                    this.input = val;
                                } 
                            }   
                        },
                        {
                            text: expand_text
                        }
                    ]
                }
            ],
            options: { 
                is_frameless: true, 
                height: 160 
            }, is_visible: true, id: this.id 
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