import FetchDefinitions from "../editor/FetchDefinitions";
import { JSONFileMasks } from "../editor/JSONFileMasks";
import InformationWindow from "../commonWindows/Information";
import EventBus from "../EventBus";
import { use } from "../utilities/useAttr";
import { detachMerge } from "../mergeUtils";

export class BridgeComponent {
    static component_name = "bridge:demo_component";

    onApply() {}
    onPropose() {}
}

export default class ComponentRegistry {
    static components = {};

    static async register(Component) {
        let name = Component.component_name;
        if(!name || name.startsWith("minecraft:")) throw new Error("Invalid component namespace: 'minecraft:'!");

        this.components[name] = new Component();
        if(typeof this.components[name].onApply !== "function") this.components[name].onApply = () => {};
        if(typeof this.components[name].onPropose !== "function") this.components[name].onPropose = () => {};

        //UPDATE ALL REFERENCES TO COMPONENT
        let refs = await FetchDefinitions.fetchSingle("entity", [ "custom_components" ], name, true);
        refs.map(
            f => JSONFileMasks.apply(f)
        );
    }
    static async reset() {
        this.components = {};
    }

    static set(MASK, component_name, component_data, simulated_call) {
        if(this.components[component_name] === undefined)
            return new InformationWindow("ERROR", `Unknown component "${component_name}"!`);
        
        //Save that this file is using the specific custom component inside the LightningCache
        if(!simulated_call) EventBus.once("bridge:onCacheHook[entity.custom_components]", () => component_name);

        let apply_data = this.components[component_name].onApply(component_data);
        if(typeof apply_data !== "object" || Array.isArray(apply_data)) return;

        MASK.reset(`component@${component_name}`);
        MASK.set(`component@${component_name}`, apply_data);
    }

    static async parse(file_path, data, simulated_call) {
        if(data === undefined) return;

        for(let component_name in this.components) {
            let c = use(data, `minecraft:entity/components/${component_name}`);

            if(c !== undefined)
                this.set(await JSONFileMasks.get(file_path), component_name, c, simulated_call);
        }
        
        await JSONFileMasks.saveMasks();
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