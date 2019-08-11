let MENU = [];

if(process.env.NODE_ENV !== "development") {
    MENU.push({
        label: "View",
        submenu: [
            { role: "reload" }
        ]
    });
} else if(process.env.NODE_ENV === "development") {
    MENU = null;
}

export default MENU;