/**
 * DataStructure used by FileDisplayer.vue to load and render directories
 */
import path from "path";
import { promises as fs } from "fs";
import OmegaCache from "./editor/OmegaCache";
import LightningCache from "./editor/LightningCache";
import { JSONFileMasks } from "./editor/JSONFileMasks";

export class FileExplorerStorage {
    static data: { 
        explorer: { [x: string]: FileExplorer }; 
        resource_pack: { [x: string]: FileExplorer }; 
    } = { explorer: {}, resource_pack: {} };

    static set(explorer_type: "explorer" | "resource_pack", project: string, file_explorer: FileExplorer) {
        this.data[explorer_type][project] = file_explorer;
    }

    static get(explorer_type: "explorer" | "resource_pack", project: string) {
        return this.data[explorer_type][project];
    }
}


export class FileExplorer {
    parent: FileExplorer;
    path: string;
    absolute_path: string;
    name: string;
    children: FileExplorer[];
    is_open: boolean;
    is_folder?: boolean;
    is_loading = true;
    loaded_children = false;

    loading_promise: Promise<void>;

    constructor(parent: FileExplorer, f_path: string, absolute_path: string, is_open=false, children: FileExplorer[]=[]) {
        this.parent = parent;
        this.path = f_path;
        this.absolute_path = absolute_path;
        this.name = path.basename(f_path);
        this.children = children;
        this.is_open = is_open;

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
        } catch(e) { }
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
    wasOpen(absolute_path: string): [boolean, FileExplorer[]] {
        for(let { absolute_path: c_path, is_open, children } of this.children) {
            if(absolute_path === c_path) return [ is_open, children ];
        }
        return [ false, [] ];
    }

    async update(absolute_path: string, f_path: string) {
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
        await Promise.all(this.children.map(c => c.update(this.absolute_path, this.path)));
    }

    async remove(first=true) {
        if(first)
            this.parent.children = this.parent.children.filter(c => c !== this);

        if(this.children.length > 0) {
            await Promise.all(this.children.map(async c => await c.remove(false)));
        } else {
            await Promise.all([
                OmegaCache.clear(this.absolute_path),
                LightningCache.clear(this.absolute_path),
                JSONFileMasks.delete(this.absolute_path)
            ]);
        }
    }
    rename(val: string) {
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