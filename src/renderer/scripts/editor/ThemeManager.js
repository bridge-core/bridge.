import { readJSONSync } from "../utilities/JsonFS";
import path from "path";
import EventBus from "../EventBus";
import ProjectConfig from "../ProjectConfig";
import Store from "../../store/index";
import fs from "fs";

function getDefaultThemes() {
    let files = fs.readdirSync(path.join(__static, "themes"));
    let res = {};
    files.map(f => {
        const { id, ...theme } = readJSONSync(path.join(__static, `themes/${f}`));
        res[id] = theme;
    });
    return res;
}

export default class ThemeManager {
    static themes = getDefaultThemes();
    static plugin_themes = {};
    static current_theme;
    static options;

    static get theme_names() {
        let theme_names = [];
        for(let id in this.themes) {
            theme_names.push({ text: this.themes[id].name, value: id });
        }
        for(let id in this.plugin_themes) {
            theme_names.push({ text: this.plugin_themes[id].name, value: id });
        }
        return theme_names.sort();
    }

    static addTheme({ id, ...theme }) {
        if(!id) return console.error("No valid ID provided for theme. IDs may not be 'falsy'");
        if(theme.definition.dark === undefined) theme.definition.dark = {};
        if(theme.definition.light === undefined) theme.definition.light = {};

        this.plugin_themes[id] = theme;
    }

    static applyTheme(id) {
        this.current_theme = id;

        //Load theme options
        this.options = (this.themes[id] || this.plugin_themes[id] || {}).options || {};
        Store.commit("setThemeOptions", this.options);

        //Load theme
        if(id !== "bridge.default.theme") EventBus.trigger("bridge:applyTheme", { update_styles: false, ...this.themes["bridge.default.theme"] });
        EventBus.trigger("bridge:applyTheme", { update_styles: true, ...(this.themes[id] || this.plugin_themes[id]) });
    }

    static async loadTheme() {
        try {
            this.applyTheme(await ProjectConfig.theme);
        } catch(err) {
            this.applyTheme("bridge.default.theme");
        }
    }

    static reset() {
        this.plugin_themes = [];
    }
}