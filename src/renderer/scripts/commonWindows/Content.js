import Store from "../../store/index";

export default class ContentWindow {
    constructor(opts, add_id) {
        this.id = `main.core.windows.content_window.${add_id}${Math.random()}`;
        this.win_def = opts;

        Store.commit("addPluginWindow", { is_visible: true, ...opts, id: this.id, onClose: () => this.close() });
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