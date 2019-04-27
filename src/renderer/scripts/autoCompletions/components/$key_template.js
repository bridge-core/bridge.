//@ts-check
export default class DynamicTemplateKey {
    static confirm(provider, key, path_arr, current) {
        return current["$dynamic_template." + key] !== undefined;
    }
    static process(provider, key, path_arr, current) {
        return provider.walk(path_arr, provider.compileTemplate(current["$dynamic_template." + key]));
    }
}