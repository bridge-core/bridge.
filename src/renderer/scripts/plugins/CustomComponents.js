import FetchDefinitions from "../editor/FetchDefinitions";
import { JSONFileMasks } from "../editor/JSONFileMasks";
import InformationWindow from "../commonWindows/Information";
import EventBus from "../EventBus";
import { use } from "../utilities/useAttr";
import { detachMerge, PUSH_ONCE } from "../mergeUtils";
import LightningCache from "../editor/LightningCache";
import FileType from "../editor/FileType";

export class BridgeComponent {
    static component_name = "bridge:demo_component";

    onApply() {}
    onPropose() {}
}

export default class ComponentRegistry {
    static components = {};
    static register_updates = [];

    static async register(Component) {
        let name = Component.component_name;
        if(!name || name.startsWith("minecraft:")) throw new Error("Invalid component namespace: 'minecraft:'!");

        this.components[name] = new Component();
        if(typeof this.components[name].onApply !== "function") this.components[name].onApply = () => {};
        if(typeof this.components[name].onPropose !== "function") this.components[name].onPropose = () => {};

        //UPDATE ALL REFERENCES TO COMPONENT
        let refs = await FetchDefinitions.fetchSingle("entity", [ "custom_components" ], name, true);
        this.register_updates = PUSH_ONCE(this.register_updates, refs);
    }
    static async registerUpdates() {
        for(let f of this.register_updates)
            await JSONFileMasks.apply(f);

        this.register_updates = [];
    }
    static async reset() {
        this.components = {};
    }

    static set(MASK, component_name, component_data={}, simulated_call=false, location="components") {
        if(this.components[component_name] === undefined)
            return new InformationWindow("ERROR", `Unknown component "${component_name}"!`);
        
        //Save that this file is using the specific custom component inside the LightningCache
        if(!simulated_call) EventBus.once("bridge:onCacheHook[entity.custom_components]", () => component_name);

        let apply_data = this.components[component_name].onApply(component_data, location);
        if(typeof apply_data !== "object" || Array.isArray(apply_data)) return;
        MASK.overwrite(`component@${component_name}`, apply_data);
    }

    static async parse(file_path, data, simulated_call) {
        if(data === undefined || data["minecraft:entity"] === undefined) return;
        const MASK = await JSONFileMasks.get(file_path);

        //RESET OLD CHANNELS
        let { custom_components } = await LightningCache.load(file_path, FileType.get(file_path)) || {};
        (custom_components || []).forEach(c => MASK.reset(`component@${c}`));

        //PROCESS CUSTOM COMPONENTS
        for(let component_name in this.components) {
            //CHECK "COMPONENTS"
            let c = use(data, `minecraft:entity/components/${component_name}`);

            if(c !== undefined)
                this.set(MASK, component_name, c, simulated_call, "components");
            
            //CHECK "COMPONENT_GROUPS"
            for(let component_group in data["minecraft:entity"].component_groups || {}) {
                let c = use(data, `minecraft:entity/component_groups/${component_group}/${component_name}`);
    
                if(c !== undefined)
                    this.set(MASK, component_name, c, simulated_call, component_group);
            }
        }
    }

    static propose() {
        let res = {};

        for(let component_name in this.components) {
            let propose_data = this.components[component_name].onPropose();
            if(typeof propose_data !== "object") continue;

            res = detachMerge(res, propose_data);
        }

        return res;
    }
}