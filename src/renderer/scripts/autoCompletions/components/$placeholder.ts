import Provider from "../Provider";

export default class Placeholder {
    static confirm(provider: Provider, key: string, path_arr: string[], current: any) {
        return current.$placeholder !== undefined;
    }
    static process(provider: Provider, key: string, path_arr: string[], current: any): any {
        return provider.walk(path_arr, current.$placeholder);
    }
}