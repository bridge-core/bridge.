/**
 * Class for sending new notifications
 */
import Store from "../store/index";
import uuid from "uuid/v4";

export class Badge {
    constructor({ color, type, content }) {
        this.color = color;
        this.type = type;
        this.content = content;
    }
}

export default class Notification {
    constructor({ display_name, display_icon, action, color, text_color }) {
        this.id = uuid();
        this.display_icon = display_icon;
        this.display_name = display_name;
        this.action = action;
        this.color = color;
        this.text_color = text_color;
        this.pushed = false;
    }

    addBadge(badge) {
        this.badge = badge;
    }

    send() {
        if(this.pushed) return;

        this.pushed = true;
        Store.commit("addNativeFooter", this);
    }
    update() {
        Store.commit("updateNativeFooter", this);
    }
    remove() {
        if(!this.pushed) return;
        
        this.pushed = false;
        Store.commit("removePluginFooter", this.id);
    }
}