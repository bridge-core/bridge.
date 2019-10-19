import DynamicTemplateKey from "./$key_template";

//@ts-check
export default class Load {
    static confirm(provider, key, path_arr, current) {
        return current.$load !== undefined;
    }
    static process(provider, key, path_arr, current) {
        let { object } = provider.omegaExpression(current.$load);

        if(object[key] !== undefined)
            return provider.walk(path_arr, object[key]);
        if(DynamicTemplateKey.confirm(provider, key, path_arr, object))
            return DynamicTemplateKey.process(provider, key, path_arr, object);
    }
}