/**
 * Simple content window. Rendered by components/windowFactory
 */
import Store from "../../store/index";
import { WindowDefinition } from "./ContentTypes";
import { uuid } from "../Utilities/useAttr";

export default class ContentWindow {
    id: string;
    win_def: WindowDefinition;
    constructor(opts: WindowDefinition, add_id?: string) {
        this.id = `main.core.windows.content_window.${add_id}${uuid()}`;
        this.win_def = opts;

        Store.commit("addPluginWindow", { is_visible: true, onClose: () => this.close(), ...opts, id: this.id });
    }

    update(opts=this.win_def) {
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