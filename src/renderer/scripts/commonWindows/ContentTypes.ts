export interface SidebarElement {
    title: string;
    icon: string;
    opacity: number;
    color: string;
    is_selected: boolean;
    action: () => any;
}

export interface WindowDefinition {
    sidebar: SidebarElement[];
    content: WindowContent[];
    actions: WindowContent[];
    options: WindowOptions;
}

export interface WindowContent {
    [x: string]: any;
}

export interface WindowOptions {
    [x: string]: any;
}