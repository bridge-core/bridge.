import Store from "../../store/index";

export default class ConfirmWindow {
    constructor(on_confirm, on_cancel, opts) {
        this.id = `main.core.windows.confirm_window.${Math.random()}`;
        this.actions = [
            {
                type: "space"
            },
            {
                type: "button",
                text: "Cancel",
                color: "error",
                is_rounded: true,
                action: () => {
                    on_cancel();
                    this.close();
                }
            },
            {
                type: "button",
                text: "Confirm",
                color: "primary",
                is_rounded: true,
                action: () => {
                    on_confirm();
                    this.close();
                }
            }
        ];
        
        Store.commit("addPluginWindow", { actions: this.actions, ...opts, is_visible: true, id: this.id });
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