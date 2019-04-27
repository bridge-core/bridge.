import Placeholder from "./components/$placeholder";
import Load from "./components/$load";
import DynamicTemplate from "./components/$dynamic_template";
import DynamicTemplateKey from "./components/$key_template";

const COMPONENTS = [ Load, DynamicTemplateKey, DynamicTemplate, Placeholder ];

export default class ComponentProvider {
    static process(provider, key, path_arr, current) {
        for(let component of COMPONENTS) {
            if(component.confirm(provider, key, path_arr, current))
                return component.process(provider, key, path_arr, current);
        }
    }
}