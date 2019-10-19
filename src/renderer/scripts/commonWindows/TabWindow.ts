/**
 * Simple tab window. Rendered by components/windowFactory
 */
import CommonWindow from "./Content";
import { SidebarElement, WindowContent, WindowOptions } from "./ContentTypes";



export class View {
    sidebar_element: SidebarElement;
    content: WindowContent;
    
    constructor(sidebar_element: SidebarElement, content: WindowContent) {
        this.sidebar_element = sidebar_element;
        this.content = content;
    }
};

export default class TabWindow extends CommonWindow {
    selected_tab: number;
    content_elements: WindowContent[];
    
    constructor(display_name: string, options: WindowOptions, add_id="tab_window") {
        super({
            display_name,
            options
        }, add_id);

        this.selected_tab = 0;
        this.win_def.sidebar = [];
        this.content_elements = [];
    }

    addTab(view: View) {
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

        if(id === 0) { this.select(0); }
    }

    select(id=this.selected_tab, force_update=false) {
        if(this.selected_tab === id && !force_update) return;

        this.selected_tab = id;
        this.win_def.sidebar.forEach(e => {
            e.opacity = 0.25;
            e.is_selected = false;
        });
        this.win_def.sidebar[id].opacity = 1;
        this.win_def.sidebar[id].is_selected = true;
        this.win_def.content = this.buildContent(id) || [ 
            { type: "header", text: "Oops :(" },
            { type: "divider" },
            { text: "\nThis page looks pretty empty. Make sure to revisit it in future versions of bridge." } 
        ];
        if(force_update) this.update(this.win_def);
    }

    buildContent(id: number) {
        if(!this.content_elements[id]) return;

        return [
            {
                type: "header",
                text: this.win_def.sidebar[id].title
            },
            {
                type: "divider"
            },
            ...this.content_elements[id].map((e: WindowContent) => {
                if(typeof e === "function") return e();
                return e;
            })
        ];
    }
}