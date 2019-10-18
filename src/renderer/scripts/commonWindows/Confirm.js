/**
 * Simple confirmation window. Rendered by components/windowFactory
 */
import Store from "../../store/index";

export default class ConfirmWindow {
    constructor(on_confirm, on_cancel, text, { cancel_text, confirm_text, ...opts }={}) {
        this.id = `main.core.windows.confirm_window.${Math.random()}`;
        this.actions = [
            {
                type: "space"
            },
            {
                type: "button",
                text: cancel_text || "Cancel",
                is_rounded: false,
                action: () => {
                    this.close();
                    if(typeof on_cancel == "function") on_cancel();
                }
            },
            {
                type: "button",
                text: confirm_text || "Confirm",
                color: "primary",
                is_rounded: false,
                action: () => {
                    this.close();
                    if(typeof on_confirm == "function") on_confirm();
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
                height: 140 
            }, is_visible: true, id: this.id,
            onClose: () => this.close()
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