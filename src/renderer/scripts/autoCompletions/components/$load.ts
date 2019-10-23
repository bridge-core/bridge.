import DynamicTemplateKey from "./$key_template";
import Provider from "../Provider";


export default class Load {
    static confirm(provider: Provider, key: string, path_arr: string[], current: any) {
        return current.$load !== undefined;
    }
    static process(provider: Provider, key: string, path_arr: string[], current: any): any {
        let { object } = provider.omegaExpression(current.$load) as any;

        if(object[key] !== undefined)
            return provider.walk(path_arr, object[key]);
        if(DynamicTemplateKey.confirm(provider, key, path_arr, object))
            return DynamicTemplateKey.process(provider, key, path_arr, object);
    }
}