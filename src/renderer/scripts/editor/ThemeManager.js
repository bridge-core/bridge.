import { readJSONSync } from "../utilities/JsonFS";
import path from "path";
import EventBus from "../EventBus";
import ProjectConfig from "../ProjectConfig";

export default class ThemeManager {
    static themes = readJSONSync(path.join(__static, "data/themes.json"));
    static plugin_themes = {};
    static current_theme;

    static get theme_names() {
        let theme_names = [];
        for(let id in this.themes) {
            theme_names.push({ text: this.themes[id].name, value: id });
        }
        for(let id in this.plugin_themes) {
            theme_names.push({ text: this.plugin_themes[id].name, value: id });
        }
        return theme_names;
    }

    static addTheme({ id, ...theme }) {
        this.plugin_themes[id] = theme;
    }

    static applyTheme(id) {
        this.current_theme = id;
        console.log(id);
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