import CommonWindow from "../scripts/commonWindows/Content";
import LightningCache from "../scripts/editor/LightningCache";


export default class LightningCacheInspector extends CommonWindow {
    constructor(file_path) {     
        super({ options: { is_persistent: false }, display_name: "Lightning Cache Inspector" }, "bridge.core.lightning_cache_inspector.");
        this.file_path = file_path;
        this.init(file_path);
    }
    async init(file_path=this.file_path) {
        const LC = await LightningCache.load(file_path);
        this.content = [
            {
                text: "\nbridge. extracts important data from your files upon saving. This data is used to improve your overall experience, including auto-completions.\n\n"
            },
            {
                type: "divider"
            },
            Object.entries(LC)
                .sort(([cache_key_a], [cache_key_b]) => cache_key_a.localeCompare(cache_key_b))
                .map(([cache_key, cache_entry]) => [
                    {
                        text: "\n"
                    },
                    {
                        type: "big-header",
                        text: `${cache_key}:`
                    },
                    {
                        text: ( cache_entry.join(", ") || "None" ) + "\n\n"
                    },
                    {
                        type: "divider"
                    }
                ])
        ].flat(Infinity);
        if(this.content.length === 2)
            this.content.push({
                text: "\nNo LightningCache data saved"
            })
        
        this.update({ content: this.content });
    }
}