//@ts-check
export default class Placeholder {
    static confirm(provider, key, path_arr, current) {
        return current.$placeholder !== undefined;
    }
    static process(provider, key, path_arr, current) {
        return provider.walk(path_arr, current.$placeholder);
    }
}