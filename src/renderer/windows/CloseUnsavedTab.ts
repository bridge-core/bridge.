import Store from "../store/index";

export default class CloseUnsavedTab {
    private id: string;
    private actions: any[];

    constructor(on_confirm: () => any, on_close: () => any, on_cancel: () => any, opts?: any) {
        this.id = `main.core.windows.confirm_window.${Math.random()}`;
        this.actions = [
            {
                type: "space"
            },
            {
                type: "button",
                text: "Cancel",
                is_rounded: false,
                action: () => {
                    this.close();
                    if(typeof on_cancel === "function") on_cancel();
                }
            },
            {
                type: "button",
                text: "Save",
                color: "success",
                is_rounded: false,
                action: () => {
                    this.close();
                    if(typeof on_confirm === "function") on_confirm();
                }
            },
            {
                type: "button",
                text: "Close",
                color: "error",
                is_rounded: false,
                action: () => {
                    this.close();
                    if(typeof on_close === "function") on_close();
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
                    text: "This tab has unsaved progress! Are you sure that you want to close it?"
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

    update(opts: any) {
        Store.commit("updatePluginWindow", { ...opts, id: this.id });
        return this;
    }

    close() {
        Store.commit("removePluginWindow", this.id);
        return this;
    }
}