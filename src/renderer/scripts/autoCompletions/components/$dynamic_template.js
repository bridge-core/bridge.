import { CONTEXT_UP } from "../Dynamic";
//@ts-check
export default class DynamicTemplate {
    static confirm(provider, key, path_arr, current) {
        return current.$dynamic_template !== undefined;
    }
    static process(provider, key, path_arr, current) {
        for(let i = 0; i < path_arr.length + 1; i++) CONTEXT_UP();

        return provider.walk(path_arr, provider.compileTemplate(current.$dynamic_template)[key]);
    }
}