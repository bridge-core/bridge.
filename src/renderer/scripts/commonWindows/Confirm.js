import Store from "../../store/index";

export default class ConfirmWindow {
    constructor(on_confirm, on_cancel, text, opts) {
        this.id = `main.core.windows.confirm_window.${Math.random()}`;
        this.actions = [
            {
                type: "space"
            },
            {
                type: "button",
                text: "Cancel",
                is_rounded: true,
                action: () => {
                    if(typeof on_cancel == "function") on_cancel();
                    this.close();
                }
            },
            {
                type: "button",
                text: "Confirm",
                color: "success",
                is_rounded: true,
                action: () => {
                    if(typeof on_confirm == "function") on_confirm();
                    this.close();
                }
            }
        ];
        
        Store.commit("addPluginWindow", { 
            actions: this.actions, 
            content: [
                {
                    type: "header",
                    text: "Confirmation"
                },
                {
                    type: "divider"
                },
                {
                    text: "\n"
                },
                {
                    text
                }
            ],
            options: { 
                is_frameless: true, 
                height: 120 
            }, is_visible: true, id: this.id 
        });
        this.update(opts);
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