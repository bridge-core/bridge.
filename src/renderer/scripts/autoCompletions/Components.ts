import Placeholder from "./components/$placeholder";
import Load from "./components/$load";
import DynamicTemplate from "./components/$dynamic_template";
import DynamicTemplateKey from "./components/$key_template";
import Provider from "./Provider";

const COMPONENTS = [ Load, DynamicTemplateKey, DynamicTemplate, Placeholder ];

export default class ComponentProvider {
    static process(provider: Provider, key: string, path_arr: string[], current: any) {
        for(let component of COMPONENTS) {
            if(component.confirm(provider, key, path_arr, current))
                return component.process(provider, key, path_arr, current);
        }
    }
}