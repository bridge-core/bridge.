/**
 * Simple information window. Rendered by components/windowFactory
 */
import Store from "../../store/index";
import { WindowDefinition } from "./ContentTypes";

export default class InformationWindow {
    id: string;

    constructor(display_name: string, display_text: string, is_persistent=true) {
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
                    text: "\n"
                },
                {
                    type: "big-header",
                    text: display_name
                },
                {
                    type: "divider"
                },
                {
                    text: "\n" + display_text
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
    }

    update(opts: WindowDefinition) {
        Store.commit("updatePluginWindow", { ...opts, id: this.id });
        return this;
    }
    close() {
        Store.commit("removePluginWindow", this.id);
        return this;
    }
    hide() {
        Store.commit("setWindowIsVisible", {
            id: this.id,
            val: false
        });
        return this;
    }
    show() {
        Store.commit("setWindowIsVisible", {
            id: this.id,
            val: true
        });
        return this;
    }
}