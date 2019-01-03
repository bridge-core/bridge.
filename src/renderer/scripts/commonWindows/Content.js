import Store from "../../store/index";

export default class ConfirmWindow {
    constructor(opts) {
        this.id = `main.core.windows.content_window.${Math.random()}`;
        
        Store.commit("addPluginWindow", { ...opts, is_visible: true, id: this.id, onClose: () => this.close() });
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