//@ts-check
export default class Load {
    static confirm(provider, key, path_arr, current) {
        return current.$load !== undefined;
    }
    static process(provider, key, path_arr, current) {
        return provider.walk(path_arr, provider.omegaExpression(current.$load).object[key]);
    }
}