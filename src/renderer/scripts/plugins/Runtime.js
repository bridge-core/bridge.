import { BASE_PATH } from "../constants";

let Runtime = {
    static_base_path: BASE_PATH,
    getBridgePath() {
        return `${BASE_PATH}${Runtime.project}/bridge/`;
    },
    getStorePath() {
        return `${BASE_PATH}${Runtime.project}/bridge/plugin_storage/`;
    },
    getProjectPath() {
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
        get: (id) => id !== undefined ? (Runtime.listeners[id] || []) : Runtime.listeners,
        add: (id, listener) => {
            if(Runtime.listeners[id] != undefined) {
                Runtime.listeners[id].push(listener);
            } else {
                Runtime.listeners[id] = [listener];
            }   
        },
        exists: (id) => Runtime.listeners[id] != undefined,
        remove: (id, cb) => Runtime.listeners[id] = Runtime.listeners[id].filter(l => l !== cb)
    },
    Menus: {
        get: (id) => id !== undefined ? Runtime.menus[id] : Runtime.menus,
        add: (id, menu) => Runtime.menus[id] = menu
    },
    Sidebar: {
        get: (id) => id !== undefined ? Runtime.sidebar[id] : Runtime.sidebar,
        add: (...elements) => Runtime.sidebar.push(...elements)
    },
    Plugins: {
        exists: (id) => Runtime.plugins[id] !== undefined,
        get: () => Runtime.plugins,
        add: (id, plg) => Runtime.plugins[id] = plg,
        getRuntimeId: () => Runtime.plugins.length
    },
    Modules: {
        get: (id) => Runtime.plugin_modules[id],
        add: (id, provide) => Runtime.plugin_modules[id] = provide,
        exists: (id) => Runtime.plugin_modules[id] != undefined
    },
    HL: {
        add: (lang_name, lang_def) => Runtime.languages[lang_name] = lang_def,
        exists: (lang_name) => Runtime.languages[lang_name] != undefined,
        remove: (lang_name) => Runtime.languages[lang_name] = undefined,
        forEach: (cb) => {
            for(let l in Runtime.languages) {
                cb(l, Runtime.languages[l]);
            }
        }
    },
    Paths: {
        bridge: () => Runtime.getBridgePath(),
        store: () => Runtime.getStorePath(),
        project: () => Runtime.getProjectPath(),
        setProject: (project) => Runtime.project = project
    },
    Project: {
        set: (project) => Runtime.project = project,
        get: () => Runtime.project
    },
    CreationWindow: {
        get: () => Runtime.creation_window,
        add: (c_w) => Runtime.creation_window.push(c_w)
    },
    reset
}