import { CONTEXT_UP, CONTEXT_DOWN } from "../Dynamic";
//@ts-check
export default class DynamicTemplateKey {
    static confirm(provider, key, path_arr, current) {
        return current["$dynamic_template." + key] !== undefined;
    }
    static process(provider, key, path_arr, current) {
        for(let i = 0; i < path_arr.length + 1; i++) CONTEXT_UP();
        let template = provider.compileTemplate(current["$dynamic_template." + key]);
        for(let i = 0; i < path_arr.length + 1; i++) CONTEXT_DOWN();

        return provider.walk(path_arr, template);
    }
}