import ContentWindow from "../scripts/commonWindows/Content";
import Store from "../store/index";

export default class LoadingWindow extends ContentWindow {
    constructor(id) {
        super({
            options: {
                is_visible: false,
                is_frameless: true,
                height: 100
            },
            content: [
                {
                    type: "header",
                    text: "Loading..."
                },
                {
                    type: "divider"
                },
                {
                    type: "loader"
                }
            ]
        }, "loading.");
        Store.commit("addLoadingWindow", { id, window: this });
        this.show = () => {
            window.setTimeout(this.internalShow, 3000);
            return this;
        };
        this.hide = () => {
            window.clearTimeout(this.internalShow);
            this.updateVisibility(false);
            return this;
        };
        this.store_id = id;
    }

    updateVisibility(val) {
        Store.commit("setWindowIsVisible", {
            id: this.id,
            val
        });
    }
    internalShow() {
        Store.commit("setWindowIsVisible", {
            id: this.id,
            val: true
        });
    }
    close() {
        Store.commit("removeLoadingWindow", { id: this.store_id });
    }
}