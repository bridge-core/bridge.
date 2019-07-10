import Store from "../store/index";
import EventBus from "./EventBus";
import { Format } from "./editor/Json";
import FileSystem from "./FileSystem";
import PluginEnv from "./plugins/PluginEnv";
import JSONTree from "./editor/JsonTree";
import { changeProvider } from "./editor/JsonTree";
import LoadingWindow from "../windows/LoadingWindow";
import ConfirmWindow from "./commonWindows/Confirm";
import { History } from "./TabSystem/CommonHistory";
import ProblemIterator from "./editor/problems/Problems";
import path from "path";
import FileType from "./editor/FileType";
import OmegaCache from "./editor/OmegaCache";
import LightningCache from "./editor/LightningCache";

/**
 * @todo Refactor TabSystem to use dedicated classes IMGTab, CMTab, JSONTab,...
 * Makes the TabSystem less complex
 * @todo Class JsonSelection to handle selected nodes
 */
class TabSystem {
    constructor() {
        this.projects = {};
        this.selected = 0;
    }
    get project() {
        return Store.state.Explorer.project.explorer;
    }
    //Whether the user has unsaved tabs open in any project
    get contains_unsaved() {
        for(let p in this.projects) {
            for(let t of this.projects[p])
                if(t.is_unsaved) return true;
        }
        return false;
    }

    //Adding tab
    add(tab) {
        if(this.projects[this.project] === undefined) this.projects[this.project] = [];

        for(let i = 0; i < this.projects[this.project].length; i++) {
            if(this.projects[this.project][i].file_path === tab.file_path.replace(/\//g, "\\")) {
                Store.commit("removeLoadingWindow", { id: "open-file" });
                return this.select(i);
            } 
        }
        
        tab.file_path = tab.file_path.replace(/\//g, "\\");
        this.projects[this.project].unshift(Object.assign(tab, {
            uuid: `${this.project}-${Math.random()}-${Math.random()}`,
            file_navigation: "global",
            category: this.project,
            is_unsaved: false,
            history: new History()
        }));
 
        EventBus.trigger("updateTabUI");
        this.select(0);
    }
    open(tab) {
        //Just an alias
        this.add(tab);
    }

    //Closing tab
    internalCloseId(id, project=this.project) {
        this.projects[project].splice(id, 1);
        if(id <= this.selected && this.selected >= 0) {
            this.select(this.selected === 0 ? 0 : this.selected - 1);
        }

        EventBus.trigger("updateTabUI");
    }
    closeById(id, project=this.project) {
        if(this.projects[project] === undefined || this.projects[project][id] === undefined)
            return;
        if(this.projects[project][id].is_unsaved) {
            new ConfirmWindow(() => {
                this.internalCloseId(id, project);
            }, null, "This tab has unsaved progress! Are you sure that you want to close it?");
        } else {
            this.internalCloseId(id, project);
        }
    }
    closeSelected() {
        this.closeById(this.selected);
    }
    close(val) {
        if(val == undefined) {
            this.projects = {};
            this.select(0);
            EventBus.trigger("updateTabUI");
        }
        else if(typeof val == "number") this.closeById(val);
        else throw new TypeError("Expected undefined or number, found " + typeof val);
    }
    closeByPath(file_path) {
        if(this.projects[this.project] === undefined) return false;
        
        for(let i = 0; i < this.projects[this.project].length; i++) {
            if(this.projects[this.project][i].file_path.replace(/\\/g, "/") === file_path.replace(/\\/g, "/")) {
                this.internalCloseId(i);
                return true;
            } 
        }
        return false;
    }

    //Getting tabs
    get(val) {
        if(!val) return this.projects[this.project];
        else if(typeof val == "number") return this.projects[this.project][val];
        else throw new TypeError("Expected undefined or number, found " + typeof val);
    }
    getSelected() {
        if(this.projects[this.project] === undefined) return;
        return this.projects[this.project][this.selected];
    }
    getCurrentNavigation() {
        if(!this.getSelected()) return;
        return this.getSelected().file_navigation;
    }
    getCurrentNavContent() {
        let nav = this.getCurrentNavigation();
        let s = this.getSelected();
        if(!s || !s.content.get) return;
        let current = s.content.get(nav);

        if(!current) return;

        if(current.path != nav) return current.data;
        return current.key;
    }
    getCurrentNavObj() {
        let nav = this.getCurrentNavigation();
        let s = this.getSelected();
        if(!s || !s.content.get) return;
        return s.content.get(nav);
    }
    getHistory() {
        return this.getSelected().history;
    }
    setCurrentNavContent(val) {
        let nav = this.getCurrentNavigation();
        let current = this.getSelected().content.get(nav);
        if(!current) return;

        if(current.path != nav) current.data = val;
        else current.key = val;

        EventBus.trigger("updateCurrentContent");
    }
    filtered() {
        if(this.projects[this.project] === undefined) return [];
        return this.projects[this.project];
    }
    navigationBack() {
        let nav = this.getCurrentNavigation().split("/");
        nav.pop();
        this.setCurrentFileNav(nav.join("/"));
    }

    //Utilities
    select(val=0) {
        if(val < 0 || (
            this.projects[this.project] !== undefined
            && this.projects[this.project][val] !== undefined
            && val > this.projects[this.project][val].length)
        ) 
            throw new TypeError("Tab to select is not within the valid range. (size of the tabs array)");
        this.selected = val;
        
        if(this.getSelected()) {
            let sel = this.getSelected();
            //UPDATES AUTO_COMPLETIONS
            changeProvider(sel.file_path);

            //PLUGIN TRIGGER
            PluginEnv.trigger("bridge:changedTab", { 
                file_path: sel.file_path,
                file_extension: path.extname(sel.file_path),
                file_type: FileType.get(sel.file_path)
            }, true);
        }
        
        //UPDATE UI
        EventBus.trigger("updateSelectedTab");
    }
    selectNavigation(str_path, tab=this.selected) {
        if(this.projects[this.project][tab].file_navigation == str_path) return;
        
        this.projects[this.project][tab].file_navigation = str_path;
        EventBus.trigger("updateFileNavigation", str_path);
        PluginEnv.trigger("bridge:selectedNode", { node: this.getSelected().content.get(str_path) }, true);
    }
    setCurrentFileNav(val) {
        this.selectNavigation(val);
    }
    setCurrentContent(c) {
        this.getSelected().content = c;
    }
    setTabCompiled(val) {
        this.getSelected().is_compiled = val;
    }
    deleteCurrent() {
        let current = this.getSelected().content;
        if(!current instanceof JSONTree) return;

        let nav = this.getCurrentNavigation();
        if(current.isDataPath(nav)) {
            current.get(nav).data = "";
        } else {
            current.get(nav).remove(undefined, true);
        }
        
        this.navigationBack();
        this.setCurrentUnsaved();
    }
    deleteCurrentChildren() {
        let current = this.getSelected().content;
        if(!current instanceof JSONTree) return;
        let nav = this.getCurrentNavigation();

        if(current.isDataPath(nav)) {
            this.navigationBack();
        }
        current = current.get(nav);

        current.data = "";
        current.children = [];

        
        this.setCurrentUnsaved();
    }
    setCurrentSaved() {
        if(this.getSelected().is_unsaved) {
            this.getSelected().is_unsaved = false;
            EventBus.trigger("updateSelectedTabUI");
        }
    }
    setCurrentUnsaved() {
        if(!this.getSelected().is_unsaved) {
            this.getSelected().is_unsaved = true;
            EventBus.trigger("updateSelectedTabUI");
        }
    }
    setCurrentInvalid() {
        this.getSelected().is_invalid = true;
    }
    get use_tabs() {
        return Store.state.Settings.use_tabs;
    }
    toggleCurrentNode() {
        try {
            this.getCurrentNavObj().toggleOpen();
        } catch(e) {}
    }

    transformContent(c, raw, toJSON=true) {
        if(raw === c) return raw;
        else if(typeof c === "string") return c;
        else if(c instanceof JSONTree) return JSON.stringify(toJSON ? Format.toJSON(c) : c.buildForCache(), null, this.use_tabs ? "\t" : "  ");
        return JSON.stringify(c, null, this.use_tabs ? "\t" : "  ");
    }
    transformForCache(c, raw) {
        if(raw === c) return raw;
        else if(typeof c === "string") return c;
        else if(c instanceof JSONTree) return c.buildForCache();
        return c;
    }

    //SAVING
    async getSaveContent(current) {
        let ext = path.extname(current.file_path);
        if(current.content instanceof JSONTree)
            ProblemIterator.findProblems(current.content);
        
        await Promise.all([
            OmegaCache.save(current.file_path, {
                format_version: 1,
                cache_content: this.transformForCache(current.content, current.raw_content)
            }), 
            LightningCache.add(current.file_path, current.content)
        ]);

        return this.transformContent(PluginEnv.trigger("bridge:saveFile", { 
            ...current,
            file_path: current.file_path.replace(/\\/g, "/"),
            content: current.content instanceof JSONTree ? 
                new JSONTree("global").buildFromObject(current.content) :
                current.content,
            file_extension: ext
        }).content, current.raw_content);
    }
    async saveCurrent() {
        let win = new LoadingWindow("save-file").show();
        PluginEnv.trigger("bridge:startedSaving", null);
        let current = this.getSelected();
        if(current === undefined || current.is_invalid) return win.close();

        // console.log(await this.getSaveContent(current))
        FileSystem.basicSave(current.file_path, await this.getSaveContent(current));

        this.setCurrentSaved();
        win.close();
    }
    async saveCurrentAs() {
        let win = new LoadingWindow("save-file").show();

        PluginEnv.trigger("bridge:startedSaving", null);
        let current = this.getSelected();
        if(current == undefined || current.is_invalid) return win.close();

        FileSystem.basicSaveAs(current.file_path, await this.getSaveContent(current));
        
        this.setCurrentSaved();
        win.close();
    }

    //MOVING & NAVIGATING
    moveCurrentUp() {
        let current = this.getCurrentNavObj();
        if(current == undefined || !current instanceof JSONTree) return;

        if(!current.moveUp()) return;
        EventBus.trigger("updateCurrentContent", this.getSelected().content);

        let old = this.getCurrentNavigation();
        this.setCurrentFileNav("global");
        this.setCurrentFileNav(old);

        this.setCurrentUnsaved();
    }
    moveCurrentDown() {
        let current = this.getCurrentNavObj();
        if(current == undefined || !current instanceof JSONTree) return;

        if(!current.moveDown()) return;
        EventBus.trigger("updateCurrentContent", this.getSelected().content);
        
        let old = this.getCurrentNavigation();
        this.setCurrentFileNav("global");
        this.setCurrentFileNav(old);

        this.setCurrentUnsaved();
    }
    moveSelectionUp() {
        let current = this.getCurrentNavObj();
        if(current == undefined || !current instanceof JSONTree) return;
        let node = current.previous();
        this.setCurrentFileNav(node.path);
    }
    moveSelectionDown() {
        let current = this.getCurrentNavObj();
        if(current == undefined || !current instanceof JSONTree) return;
        let node = current.next();
        this.setCurrentFileNav(node.path);
    }
}

export default new TabSystem();