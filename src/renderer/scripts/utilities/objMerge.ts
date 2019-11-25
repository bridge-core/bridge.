export interface MergeOptions {
    array_merge?: (obj1?: any, obj2?: any, path?: string) => any;
    custom_merge?: (obj1?: any, obj2?: any, key?: string, path?: string) => any;
}

export default function objMerge(obj1: any, obj2: any, options: MergeOptions={}, path="") {
    let res: any = {};
    let { array_merge, custom_merge } = options;
    if(array_merge === undefined) array_merge = (obj2) => obj2;

    if(typeof obj2 !== "object" || typeof obj1 !== "object") return obj2;
    if(Array.isArray(obj1) || Array.isArray(obj2)) {
        return array_merge(obj1, obj2, path);
    }

    for(let key in obj1) {
        if(key in obj2) {
            if(typeof custom_merge === "function") res[key] = custom_merge(obj1[key], obj2[key], key, path === "" ? key : `${path}/${key}`);
            if(res[key] === undefined) res[key] = objMerge(obj1[key], obj2[key], options, path === "" ? key : `${path}/${key}`);
        } else {
            res[key] = obj1[key];
        }
    }

    for(let key in obj2) {
        if(!(key in obj1)) {
            res[key] = obj2[key];
        }
    }

    return res;
}

export function objMergeAll(arr: any[], options={}) {
    return arr.reduce((prev: any, curr: any) => objMerge(prev, curr, options), {});
}