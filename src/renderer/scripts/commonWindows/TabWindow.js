import CommonWindow from "./Content";

export class View {
    constructor(sidebar_element, content) {
        this.sidebar_element = sidebar_element;
        this.content = content;
    }
};

export default class TabWindow extends CommonWindow {
    constructor(display_name, options, add_id="tab_window") {
        super({
            display_name,
            options,
            sidebar: []
        }, add_id);

        this.selcted_tab = null;
        this.content_elements = [];
    }

    addTab(view) {
        let id = this.content_elements.length;
        this.win_def.sidebar.push({
            ...view.sidebar_element,
            opacity: 0.25,
            action: () => {
                console.log(id);
                
                this.select(id);
                this.update();
            }
        });
        this.content_elements.push(view.content);

        if(id == 0) this.select(0);
    }

    select(id) {
        if(this.selcted_tab == id) return;

        this.selcted_tab = id;
        this.win_def.sidebar.forEach(e => e.opacity = 0.25);
        this.win_def.sidebar[id].opacity = 1;
        this.win_def.content = this.content_elements[id] || [ { type: "header", text: "Oops :(" }, { text: "This page looks pretty empty." } ];
    }
}