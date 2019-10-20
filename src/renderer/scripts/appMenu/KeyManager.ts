/**
 * Bind and unbind keyboard shortcuts
 */
declare var document: any;

import MouseTrap from "mousetrap";
let mouseTrap = MouseTrap(document.body);

export interface KeybindObj {
    shortcut: string;
    type?: "submenu" | "divider";
    action: () => any;
    elements?: KeybindObj[]
}

function bind(elements: KeybindObj[]) {
    if(elements) elements.forEach(e => {
        if(e.shortcut && e.action) {
            let key = e.shortcut.toLowerCase().replace(/ /g, "");

            mouseTrap.bind(key, (ev: any) => {
                ev.preventDefault();
                performAction(e.action);
            });
        } 

        if(e.type == "submenu" && e.elements) {
            bind(e.elements);
        }
    });
}

function unbind(elements: KeybindObj[]) {
    if(elements) elements.forEach(e => {
        if(e.shortcut && e.action) {
            let key = e.shortcut.toLowerCase().replace(/ /g, "");
            mouseTrap.unbind(key);
        } 

        if(e.type == "submenu" && e.elements) {
            unbind(e.elements);
        }
    });
}

function performAction(action: () => any, trusted?: boolean) {
    if(typeof action != "function") return () => {};
    action();  
}

export default {
    bind,
    unbind
}