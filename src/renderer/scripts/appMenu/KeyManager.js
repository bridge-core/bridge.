import MouseTrap from "mousetrap";
import Store from "../../store/index.js";
let mouseTrap = MouseTrap(document.body);

function bind(elements) {
    elements.forEach(e => {
        if(e.shortcut && e.action) {
            let key = e.shortcut.toLowerCase().replace(/ /g, "");

            mouseTrap.bind(key, (ev) => {
                ev.preventDefault();
                performAction(e.action);
            });
        } 

        if(e.type == "submenu" && e.elements) {
            bind(e.elements);
        }
    });
}

function unbind(elements) {
    elements.forEach(e => {
        if(e.shortcut && e.action) {
            let key = e.shortcut.toLowerCase().replace(/ /g, "");
            mouseTrap.unbind(key);
        } 

        if(e.type == "submenu" && e.elements) {
            unbind(e.elements);
        }
    });
}

function performAction(action, trusted) {
    if(typeof action != "function") return () => {};
    action();  
}

export default {
    bind,
    unbind
}