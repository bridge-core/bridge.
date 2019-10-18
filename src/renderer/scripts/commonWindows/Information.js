/**
 * Simple information window. Rendered by components/windowFactory
 */
import Store from "../../store/index";

export default class InformationWindow {
    constructor(display_name, display_text, is_persistent=true) {
        this.id = `main.core.windows.information_window.${Math.random()}.${Math.random()}`;

        Store.commit("addPluginWindow", { 
            display_name,
            is_visible: true,
            options: {
                is_persistent,
                is_frameless: true,
                height: 120
            }, content: [
                {
                    type: "header",
                    text: display_name
                },
                {
                    type: "divider"
                },
                {
                    text: display_text
                }
            ], actions: [
                {
                    type: "space"
                },
                {
                    type: "button",
                    color: "primary",
                    is_rounded: false,
                    text: "Okay",
                    action: () => this.close()
                }
            ],
            id: this.id,
            onClose: () => this.close() 
        });

        this.update = (opts) => {
            Store.commit("updatePluginWindow", { ...opts, id: this.id });
            return this;
        };
        this.close = () => {
            Store.commit("removePluginWindow", this.id);
            return this;
        };
        this.hide = () => {
            Store.commit("setWindowIsVisible", {
                id: this.id,
                val: false
            });
            return this;
        };
        this.show = () => {
            Store.commit("setWindowIsVisible", {
                id: this.id,
                val: true
            });
            return this;
        };
    }
}