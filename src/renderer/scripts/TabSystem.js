import Store from "../store/index";
import EventBus from "./EventBus";
import { Format } from "./editor/Json";
import FileSystem from "./FileSystem";
import PluginEnv from "./plugins/PluginEnv";
import JSONTree from "./editor/JsonTree";
import { changeProvider } from "./editor/JsonTree";
import PluginAssert from "./plugins/PluginAssert";
import LoadingWindow from "../windows/LoadingWindow";
import ConfirmWindow from "./commonWindows/Confirm";
import { History } from "./TabSystem/CommonHistory";
import ProblemIterator from "./editor/problems/Problems";

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
        if(id <= this.selected && this.selected > 0) {
            this.select(this.selected - 1);
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
            //UPDATES AUTO_COMPLETIONS
            changeProvider(this.getSelected().file_path);

            //PLUGIN TRIGGER
            PluginEnv.trigger("bridge:changedTab", { 
                file_path: this.getSelected().file_path,
                file_extension: this.getSelected().file_path.split(/\\|\//g).pop()
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

    //SAVING
    getSaveContent(current, previous) {
        let ext = current.file_path.split(/\/|\\/).pop().split(".").pop();

        if(ext  == "json") {
            let j;  
            // console.log(current.content instanceof JSONTree, current, previous);
            
            if(current.content instanceof JSONTree) {
                ProblemIterator.findProblems(current.content);
                j = Format.toJSON(current.content, false);
            } else {
                j = current.content;
                current.content = new JSONTree("global").buildFromObject(j);
            }
            
            
            if(!current.is_invalid) {
                FileSystem.Cache.save(current.file_path, current.content.buildForCache(), PluginEnv.trigger("bridge:cacheFile", { 
                    file_path: current.file_path,
                    content: current.content,
                    file_extension: ext,
                    old_cache: FileSystem.Cache.getSync(current.file_path)
                }, true, false), 1);
            } 

            let modified_data = PluginEnv.trigger("bridge:saveFile", { 
                ...current,
                file_path: current.file_path.replace(/\\/g, "/"),
                content: new JSONTree("global").buildFromObject(j),
                file_extension: ext,
                previous
            });
            
            return JSON.stringify(Format.toJSON(modified_data.content), null, this.use_tabs ? "\t" : "  ");
        } else if(ext == "png") {
            return current.raw_content;
        } else if(ext == "ogg") {
            return current.raw_content;
        } else {
            FileSystem.Cache.save(current.file_path, current.content, PluginEnv.trigger("bridge:cacheFile", { 
                file_path: current.file_path,
                content: current.content,
                file_extension: ext
            }, true, false));

            let modified_data = PluginEnv.trigger("bridge:saveFile", { 
                ...current,
                file_path: current.file_path.replace(/\\/g, "/"),
                file_extension: ext,
                previous
            });

            return modified_data.content;
        }
    }
    updateDependencies(file_path, previous, cap=100) {
        if(cap <= 0) return PluginAssert.throw("Dependency Update Failed", new Error("Reached maximum update depth. Make sure you haven't created a dependency loop!"));
        FileSystem.Cache.get(file_path)
            .then(cache => {
                if(cache.update !== undefined) {
                    cache.update.forEach(file => {
                        console.log("[UPDATE] Dependency " + file);
                        FileSystem.Cache.get(file)
                            .then(d_cache => {
                                this.dependencyUpdate({ 
                                    ...d_cache,
                                    content: JSONTree.buildFromCache(d_cache.content),
                                    file_path: file
                                }, previous, cap);
                            })
                            // .catch(err => console.log("File \"" + file + "\" does not exist in cache. Cannot update."));
                            .catch(err => console.error(err));
                    });
                }
            })
            .catch((err) => {
                console.log("No file dependencies detected!");
                throw err;
            });
    }
    dependencyUpdate(current, previous, cap) {
        FileSystem.basicSave(current.file_path, this.getSaveContent(current, previous));
        //PluginEnv.trigger("bridge:updateFile", { file_path: current.file_path, content: this.getSaveContent(current) }, true);
        this.updateDependencies(current.file_path, cap - 1);
    }
    saveCurrent() {
        let win = new LoadingWindow("save-file").show();

        PluginEnv.trigger("bridge:startedSaving", null);
        let current = this.getSelected();
        if(current === undefined) return win.close();

        FileSystem.basicSave(current.file_path, this.getSaveContent(current));

        this.updateDependencies(current.file_path, current);
        this.setCurrentSaved();
        win.close();
    }
    saveCurrentAs() {
        let win = new LoadingWindow("save-file").show();

        PluginEnv.trigger("bridge:startedSaving", null);
        let current = this.getSelected();
        if(current == undefined) return win.close();

        FileSystem.basicSaveAs(current.file_path, this.getSaveContent(current));
        
        this.updateDependencies(current.file_path);
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