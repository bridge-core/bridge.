/**
 * Class for sending notifications
 * Notifications appear inside the app footer
 */
import Store from "../store/index";
import uuid from "uuid/v4";

export interface BadgeObj {
    color: string;
    type: 'icon' | 'text';
    content: string;
}
export interface NotificationObj {
    display_icon: string;
    display_name: string;
    color: string;
    text_color: string;
    action: () => any;
}

export class Badge {
    color: string;
    type: 'icon' | 'text';
    content: string;
    constructor({ color, type, content }: BadgeObj) {
        this.color = color;
        this.type = type;
        this.content = content;
    }
}

export default class Notification {
    id: string;
    display_icon: string;
    display_name: string;
    color: string;
    text_color: string;
    is_pushed: boolean;
    badge: Badge;
    action: () => any;

    constructor({ display_name, display_icon, action, color, text_color }: NotificationObj) {
        this.id = uuid();
        this.display_icon = display_icon;
        this.display_name = display_name;
        this.action = action;
        this.color = color;
        this.text_color = text_color;
        this.is_pushed = false;
    }

    addBadge(badge: Badge) {
        this.badge = badge;
    }

    send() {
        if(this.is_pushed) return;

        this.is_pushed = true;
        Store.commit("addNativeFooter", this);
    }
    update() {
        Store.commit("updateNativeFooter", this);
    }
    remove() {
        if(!this.is_pushed) return;
        
        this.is_pushed = false;
        Store.commit("removePluginFooter", this.id);
    }
}