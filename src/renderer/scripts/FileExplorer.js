import path from "path";
import { promises as fs } from "fs";
import OmegaCache from "./editor/OmegaCache";
import LightningCache from "./editor/LightningCache";
import { JSONFileMasks } from "./editor/JSONFileMasks";

export class FileExplorerStorage {
    static data = { explorer: {}, resource_pack: {} };

    static set(explorer_type, project, file_explorer) {
        this.data[explorer_type][project] = file_explorer;
    }

    static get(explorer_type, project) {
        return this.data[explorer_type][project];
    }
}


export class FileExplorer {
    constructor(parent, f_path, absolute_path, is_open=false, children=[]) {
        this.parent = parent;
        this.path = f_path;
        this.absolute_path = absolute_path;
        this.name = path.basename(f_path);
        this.children = children;
        this.is_loading = true;
        this.is_open = is_open;
        this.loaded_children = false;

        this.loading_promise = this.init();
        if(children.length > 0) {
            this.loaded_children = true;
            this.refresh();
        }
    }


    async init() {
        try {
            this.is_folder = (await fs.lstat(this.absolute_path)).isDirectory();
            this.is_loading = false;
            if(this.parent) this.parent.sort();
        } catch(e) { console.error(e); }
    }
    async load() {
        this.children = (await fs.readdir(this.absolute_path)).map(p => new FileExplorer(this, path.join(this.path, p), path.join(this.absolute_path, p)));
        this.loaded_children = true;
    }
    async refresh() {
        this.children = (await fs.readdir(this.absolute_path))
            .map(p => 
                new FileExplorer(
                    this,
                    path.join(this.path, p),
                    path.join(this.absolute_path, p),
                    ...this.wasOpen(path.join(this.absolute_path, p))
                )
            );
    }

    sort() {
        this.children = this.children.sort((a, b) => {
            if(a.is_folder && !b.is_folder) return -1;
            if(!a.is_folder && b.is_folder) return 1;
            if(a.name > b.name) return 1;
            if(a.name < b.name) return -1;
            return 0;
        });
    }
    wasOpen(absolute_path) {
        for(let { absolute_path: c_path, is_open, children } of this.children) {
            if(absolute_path === c_path) return [ is_open, children ];
        }
        return [ false, [] ];
    }

    async update(absolute_path, f_path) {
        if(this.is_loading) await this.loading_promise;
        if(!this.is_folder) {
            await Promise.all([
                OmegaCache.rename(this.absolute_path, path.join(absolute_path, this.name)),
                LightningCache.rename(this.absolute_path, path.join(absolute_path, this.name)),
                JSONFileMasks.rename(this.absolute_path, path.join(absolute_path, this.name))
            ]);
        }

        this.absolute_path = path.join(absolute_path, this.name);
        this.path = path.join(f_path, this.name);
        
        if(!this.loaded_children && this.is_folder) await this.load();
        await Promisea.all(this.children.map(c => c.update(this.absolute_path, this.path)));
    }

    remove() {
        this.parent.children = this.parent.children.filter(c => c !== this);
    }
    rename(val) {
        this.name = val;
        this.absolute_path = path.join(this.parent.absolute_path, val);
        this.path = path.join(this.parent.path, val);
    }

    open() {
        this.is_open = true;
        if(!this.loaded_children) this.load();
        return this;
    }
    close() {
        this.is_open = false;
        return this;
    }
}