import Store from "../store/index";
import EventBus from "./EventBus";
import { Format } from "./editor/Json";
import FileSystem from "./FileSystem";

class TabSystem {
    constructor() {
        this.tabs = [];
        this.selected = 0;
    }

    //Adding tab
    add(tab) {
        for(let i = 0; i < this.tabs.length; i++) {
            if(this.tabs[i].file_path == tab.file_path) return this.select(i);
        }
        
        this.tabs.unshift(Object.assign(tab, {
            uuid: `${Store.state.Explorer.project}-${Math.random()}-${Math.random()}`,
            file_navigation: "global",
            category: Store.state.Explorer.project
        }));

        this.select(0);
        EventBus.trigger("updateTabUI");
    }
    open(tab) {
        //Just an alias
        this.add(tab);
    }

    //Closing tab
    closeById(id) {
        this.tabs.splice(id, 1);
        EventBus.trigger("updateTabUI");
    }
    closeSelected() {
        this.closeById(this.selected);
    }
    close(val) {
        if(!val) this.tabs = [];
        else if(typeof val == "number") this.closeById(val);
        else throw new TypeError("Expected undefined or number, found " + typeof val);
    }

    //Getting tabs
    get(val) {
        if(!val) return this.tabs;
        else if(typeof val == "number") return this.tabs[val];
        else throw new TypeError("Expected undefined or number, found " + typeof val);
    }
    getSelected() {
        return this.tabs[this.selected];
    }
    getCurrentNavigation() {
        return this.tabs[this.selected].file_navigation;
    }
    getCurrentNavContent() {
        let nav = this.getCurrentNavigation();
        let s = this.getSelected();
        if(!s.content.get) return;
        let current = s.content.get(nav);

        if(!current) return;

        if(current.path != nav) return current.data;
        return current.key;
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
        let c = Store.state.Explorer.project;
        return this.tabs.filter(t => t.category == c);
    }
    navigationBack() {
        let nav = this.getCurrentNavigation().split("/");
        nav.pop();
        this.setCurrentFileNav(nav.join("/"));
    }

    //Utilities
    select(val) {
        if(val < 0 || val > this.tabs.length) throw new TypeError("Tab to select is not within the valid range. (size of the tabs array)");
        this.selected = val;
        EventBus.trigger("updateSelectedTab");
    }
    selectNavigation(str_path, tab=this.selected) {
        this.tabs[tab].file_navigation = str_path;
        EventBus.trigger("updateFileNavigation");
    }
    setCurrentFileNav(val) {
        this.selectNavigation(val);
    }
    setCurrentContent(c) {
        this.tabs[this.selected].content = c;
    }
    setTabCompiled(val) {
        this.tabs[this.selected].is_compiled = val;
    }
    deleteCurrent() {
        this.getSelected().content.get(this.getCurrentNavigation()).remove();
        this.navigationBack();
        this.setCurrentUnsaved();
    }
    setCurrentSaved() {
        this.getSelected().is_unsaved = false;
        //EventBus.trigger("updateTabUI");
        EventBus.trigger("updateSelectedTabUI", false);
    }
    setCurrentUnsaved() {
        this.getSelected().is_unsaved = true;        
        //EventBus.trigger("updateTabUI");
        EventBus.trigger("updateSelectedTabUI", true);
    }
    get use_tabs() {
        return Store.state.Settings.use_tabs;
    }

    //SAVING
    saveCurrent() {
        let current = this.getSelected();
        FileSystem.basicSave(current.file_path, JSON.stringify(Format.toJSON(current.content), null, this.use_tabs ? "\t" : "  "));
        this.setCurrentSaved(); 
    }
    saveCurrentAs() {
        let current = this.getSelected();
        FileSystem.basicSaveAs(current.file_path, JSON.stringify(Format.toJSON(current.content), null, this.use_tabs ? "\t" : "  "));
        this.setCurrentSaved();
    }
}

export default new TabSystem();