import CommonWindow from "../scripts/commonWindows/Content";
import { CURRENT } from "../scripts/constants";
import { JSONFileMasks } from "../scripts/editor/JSONFileMasks";
import OmegaCache from "../scripts/editor/OmegaCache";
import JSONTree from "../scripts/editor/JsonTree";
import TabSystem from "../scripts/TabSystem";
import path from "path";
import { uuid } from "../scripts/utilities/useAttr";
import { readJSON } from "../scripts/utilities/JsonFS";

class ReactiveListEntry {
    constructor(key, channel, mask, parent) {
        this.type = "card";
        this.is_tiled = true;
        this.elevation = 0;
        this.below_content = [
            {
                text: key
            },
            {
                type: "space"
            },
            {
                type: "icon-button",
                text: "mdi-eye",
                color: "primary",
                only_icon: true,
                action: () => {
                    TabSystem.add({
                        content: channel,
                        is_immutable: true,
                        file_path: path.join(CURRENT.PROJECT_PATH, `entities/${uuid()}.json`),
                        file_name: key
                    });
                    parent.close();
                }
            },
            {
                type: "icon-button",
                text: "mdi-delete",
                color: "error",
                only_icon: true,
                action: () => {
                    mask.reset(key);
                    parent.init();
                    JSONFileMasks.saveMasks();
                }
            }
        ]
    }
}
class ReactiveList {
    constructor(parent) {
        this.parent = parent;
    }
    get content() {
        let mask = this.parent.data;
        let res = [{ type: "divider" }];
        for(let key in mask.data) {
            if(mask.data[key] === undefined) continue;
            res.push(new ReactiveListEntry(key, mask.data[key], mask, this.parent));
            res.push({ type: "divider" });
        }

        if(this.parent.base_layer !== undefined) {
            res.unshift({
                type: "card",
                is_tiled: true,
                elevation: 0,
                below_content: [
                    {
                        text: "BASE_LAYER"
                    },
                    {
                        type: "space"
                    },
                    {
                        type: "icon-button",
                        text: "mdi-eye",
                        color: "primary",
                        only_icon: true,
                        action: () => {
                            TabSystem.add({
                                content: this.parent.base_layer,
                                is_immutable: true,
                                file_path: path.join(CURRENT.PROJECT_PATH, `entities/${uuid()}.json`),
                                file_name: "BASE_LAYER"
                            });
                            this.parent.close();
                        }
                    },
                    {
                        type: "icon-button",
                        text: "mdi-delete",
                        color: "error",
                        only_icon: true,
                        action: () => {
                            OmegaCache.clear(this.parent.file_path);
                            this.parent.base_layer = undefined;
                            this.parent.init();
                        }
                    }
                ]
            });
        }
        
        if(this.parent.composed_file !== undefined) {
            res.push({
                type: "card",
                is_tiled: true,
                elevation: 0,
                below_content: [
                    {
                        text: "COMPOSED_FILE"
                    },
                    {
                        type: "space"
                    },
                    {
                        type: "icon-button",
                        text: "mdi-eye",
                        color: "primary",
                        only_icon: true,
                        action: () => {
                            TabSystem.add({
                                content: this.parent.composed_file,
                                is_immutable: true,
                                file_path: path.join(CURRENT.PROJECT_PATH, `entities/${uuid()}.json`),
                                file_name: "COMPOSED_FILE"
                            });
                            this.parent.close();
                        }
                    },
                    {
                        type: "icon-button",
                        text: "mdi-delete",
                        color: "error",
                        only_icon: true,
                        is_disabled: true
                    }
                ]
            });
        }

        return res;
    }
    get() {
        return {
            type: "container",
            content: this.content
        };
    }
}

export default class ManageFileMasks extends CommonWindow {
    constructor(file_path) {     
        super({ options: { is_persistent: false }, display_name: "File Layers" }, "bridge.core.manage_file_masks.");
        this.file_path = file_path;
        this.init(file_path);
    }
    async init(file_path=this.file_path) {
        this.data = await JSONFileMasks.get(file_path);
        try {
            let { format_version, cache_content } = await OmegaCache.load(file_path);
            if(format_version === 1) {
                this.base_layer = JSONTree.buildFromCache(cache_content).toJSON();
            } else {    
                this.base_layer = cache_content;
            }
        } catch(e) {}
        try {
            this.composed_file = await readJSON(file_path);
        } catch(e) {}

        this.content = [
            {
                text: "For bridge., files consist of multiple layers which get composed into a single file upon saving. This enables custom syntax to seamlessly interact with your files. You can view and manage the different file layers inside of this window.\n\n"
            },
            new ReactiveList(this).get()
        ];
        if(this.content[1].content.length === 1) {
            this.content.push({ text: "This file currently has no file layers." });
        }
        
        this.update({ content: this.content });
    }
}