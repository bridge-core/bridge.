import CommonWindow from "../scripts/commonWindows/Content";
import LightningCache from "../scripts/editor/LightningCache";
import FetchDefinitions from "../scripts/editor/FetchDefinitions";
import FileType from "../scripts/editor/FileType";
import path from "path";
import { CURRENT } from "../scripts/constants";
import FileSystem from "../scripts/FileSystem";

function findID(arr: [string, string[]][]) {
    for(const [cache_key, [id]] of arr) {
        if(cache_key === "identifiers") return id;
    }
    return "none";
}

export default class FileInspector extends CommonWindow {
    private file_path: string;
    private content: any[];
    
    constructor(file_path: string) {     
        super({ options: { is_persistent: false }, display_name: "File Inspector" }, "bridge.core.file_inspector.");
        this.file_path = file_path;
        this.init(file_path);
    }
    async init(file_path=this.file_path) {
        const LC = Object.entries(await LightningCache.loadType(file_path));

        //Output regular lightning cache data
        this.content = [
            {
                text: "\nbridge. extracts important data from your files upon saving. This data is used to improve your overall development experience, including auto-completions.\n\n"
            },
            {
                type: "divider"
            },
            LC.sort(([cache_key_a], [cache_key_b]) => cache_key_a.localeCompare(cache_key_b))
                .map(([cache_key, cache_entry]) => [
                    {
                        text: "\n"
                    },
                    {
                        type: "big-header",
                        text: `${cache_key.charAt(0).toUpperCase()}${cache_key.slice(1).replace(/\_/g, " ")}:`
                    },
                    {
                        text: ( cache_entry.map(e => `- ${e}`).join("\n") || "None" ) + "\n\n"
                    },
                    {
                        type: "divider"
                    }
                ])
        ].flat(Infinity);

        //Display files using this file if it is an entity tag
        if(FileType.get(file_path) === "entity_tag") {
            const ID = findID(LC);
            const USED_BY = await FetchDefinitions.fetchSingle("entity", ["bridge_core_tags"], ID, true);

            if(USED_BY.length === 0) {
                this.content.push(...[
                    {
                        text: "\n"
                    },
                    {
                        type: "big-header",
                        text: `Used by:`
                    },
                    {
                        text: `No files currently use this tag.`,
                    }
                ]);
            } else {
                this.content.push(...[
                    {
                        text: "\n"
                    },
                    {
                        type: "big-header",
                        text: `Used by:`
                    },
                    USED_BY
                        .map(f => [f, path.relative(CURRENT.PROJECT_PATH, f).replace(/\\/g, "/")])
                        .map(([abs, f]) => [
                            {
                                text: `- `,
                            },
                            {
                                text: `${f}\n`,
                                color: "info",
                                action: () => {
                                    this.close();
                                    FileSystem.openFile(abs);
                                }
                            }
                        ])
                ].flat(Infinity));
            }
        }

        //Display text if no data found
        if(this.content.length === 2)
            this.content.push({
                text: "\nNo file data found"
            });
        
        this.update({ content: this.content });
    }
}