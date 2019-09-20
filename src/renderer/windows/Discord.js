import Store from "../store/index";

export default class DiscordWindow {
    constructor(on_confirm, on_cancel) {
        this.id = `main.core.windows.confirm_window.${Math.random()}`;
        this.actions = [
            {
                type: "space"
            },
            {
                type: "button",
                text: "Later",
                action: () => {
                    this.close();
                    if(typeof on_cancel == "function") on_cancel();
                }
            },
            {
                type: "button",
                text: "Join",
                icon: "mdi-discord",
                color: "#7289DA",
                text_color: "white",
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
                    text: "Discord"
                },
                {
                    type: "divider"
                },
                {
                    text: "\n"
                },
                {
                    text: "Join the official bridge. Discord server!"
                }
            ],
            options: { 
                is_frameless: true, 
                height: 140 
            }, is_visible: true, id: this.id,
            onClose: () => this.close()
        });
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