import { BASE_PATH } from "../constants";

export interface RuntimeTypes {
    static_base_path: string;
    listeners: {
        [x: string]: ((a: any) => any)[];
    };
    plugins: any[];
    menus: any[];
    sidebar: any[];
    plugin_modules: any;
    languages: any;
    creation_window: any[];
    project: string;

    getBridgePath(): string;
    getStorePath(): string;
    getProjectPath(): string;
}   

let Runtime: RuntimeTypes = {
    static_base_path: BASE_PATH,
    project: "",
    getBridgePath(): string {
        return `${BASE_PATH}${Runtime.project}/bridge/`;
    },
    getStorePath(): string {
        return `${BASE_PATH}${Runtime.project}/bridge/plugin_storage/`;
    },
    getProjectPath(): string {
        return `${BASE_PATH}${Runtime.project}/`;
    },
    listeners: {},
    plugins: [],
    menus: [],
    sidebar: [],
    plugin_modules: {},
    languages: {},
    creation_window: []
};

function reset() {
    Runtime = Object.assign(Runtime, {
        listeners: {},
        plugins: [],
        menus: [],
        sidebar: [],
        plugin_modules: {},
        languages: {},
        creation_window: []
    });
}

export default {
    Listeners: {
        get: (id: string) => id !== undefined ? (Runtime.listeners[id] || []) : Runtime.listeners,
        add: (id: string, listener: (a: any) => any) => {
            if(Runtime.listeners[id] != undefined) {
                Runtime.listeners[id].push(listener);
            } else {
                Runtime.listeners[id] = [listener];
            }   
        },
        exists: (id: string) => Runtime.listeners[id] != undefined,
        remove: (id: string, listener: (a: any) => any) => Runtime.listeners[id] = Runtime.listeners[id].filter(l => l !== listener)
    },
    Menus: {
        get: (id: number) => id !== undefined ? Runtime.menus[id] : Runtime.menus,
        add: (id: number, menu: any) => Runtime.menus[id] = menu
    },
    Sidebar: {
        get: (id: number) => id !== undefined ? Runtime.sidebar[id] : Runtime.sidebar,
        add: (...elements: any[]) => Runtime.sidebar.push(...elements)
    },
    Plugins: {
        exists: (id: number) => Runtime.plugins[id] !== undefined,
        get: () => Runtime.plugins,
        add: (id: number, plg: any) => Runtime.plugins[id] = plg,
        getRuntimeId: () => Runtime.plugins.length
    },
    Modules: {
        get: (id: string) => Runtime.plugin_modules[id],
        add: (id: string, provide: any) => Runtime.plugin_modules[id] = provide,
        exists: (id: string) => Runtime.plugin_modules[id] != undefined
    },
    HL: {
        add: (lang_name: string, lang_def: any) => Runtime.languages[lang_name] = lang_def,
        exists: (lang_name: string) => Runtime.languages[lang_name] != undefined,
        remove: (lang_name: string): void => Runtime.languages[lang_name] = undefined,
        forEach: (cb: (l: string, lang: any) => any) => {
            for(let l in Runtime.languages) {
                cb(l, Runtime.languages[l]);
            }
        }
    },
    Paths: {
        bridge: () => Runtime.getBridgePath(),
        store: () => Runtime.getStorePath(),
        project: () => Runtime.getProjectPath(),
        setProject: (project: string) => Runtime.project = project
    },
    Project: {
        set: (project: string) => Runtime.project = project,
        get: () => Runtime.project
    },
    CreationWindow: {
        get: () => Runtime.creation_window,
        add: (c_w: any) => Runtime.creation_window.push(c_w)
    },
    reset
}