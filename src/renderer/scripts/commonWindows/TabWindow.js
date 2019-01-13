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
                this.select(id);
                this.update();
            }
        });
        this.content_elements.push(view.content);

        if(id == 0) { this.select(0); }
    }

    select(id) {
        if(this.selcted_tab == id) return;

        this.selcted_tab = id;
        this.win_def.sidebar.forEach(e => e.opacity = 0.25);
        this.win_def.sidebar[id].opacity = 1;
        this.win_def.content = this.buildContent(id) || [ 
            { type: "header", text: "Oops :(" },
            { type: "divider" },
            { text: "\nThis page looks pretty empty. Make sure to revisit it in future versions of bridge." } 
        ];
    }

    buildContent(id) {
        if(!this.content_elements[id]) return;

        return [
            {
                type: "header",
                text: this.win_def.sidebar[id].title
            },
            {
                type: "divider"
            },
            ...this.content_elements[id]
        ];
    }
}