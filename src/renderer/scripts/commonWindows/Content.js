import Store from "../../store/index";

export default class ContentWindow {
    constructor(opts) {
        this.id = `main.core.windows.content_window.${Math.random()}`;
        this.win_def = opts;
        Store.commit("addPluginWindow", { ...opts, is_visible: true, id: this.id, onClose: () => this.close() });

        this.update = (opts=this.win_def) => {
            Store.commit("updatePluginWindow", { ...opts, id: this.id });
            return this;
        };
        this.close = () => {
            Store.commit("removePluginWindow", this.id);
            return this;
        };
    }
}