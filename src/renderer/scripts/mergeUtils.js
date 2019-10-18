/**
 * Utilities for merging objects
 */
import deepmerge from "deepmerge";
import objMerge, { objMergeAll } from "./utilities/objMerge";

const ARRAY_MERGE = (target, source) => {
    let tmp = [];
    source.forEach(e => {
        if(typeof e !== "object") tmp.push(e);
        else tmp.push(detachObj({}, e));
    });
    target.forEach(e => {
        if(typeof e !== "object") tmp.push(e);
        else tmp.push(detachObj({}, e));
    });
    return tmp;
};
const ARRAY_OVERWRITE = (target, source) => {
    let tmp = [];
    source.forEach(e => {
        if(typeof e !== "object") tmp.push(e);
        else tmp.push(detachObj({}, e));
    });
    return tmp;
};
const PUSH_ONCE = (target, source) => {
    let res = [];

    target.concat(source).forEach(e => {
        if(!res.includes(e)) res.push(e);
    });
    
    return res;
};

const detachObj = (...objs) => {
    if(objs.length == 1) return deepmerge({}, objs[0], { arrayMerge: ARRAY_OVERWRITE });
    if(objs.length == 2) return deepmerge(objs[0], objs[1], { arrayMerge: ARRAY_OVERWRITE });
    return deepmerge.all(objs, { arrayMerge: ARRAY_OVERWRITE });
};
const detachMerge = (...objs) => {
    if(objs.length == 1) return deepmerge({}, objs[0], { arrayMerge: ARRAY_MERGE });
    if(objs.length == 2) return deepmerge(objs[0], objs[1], { arrayMerge: ARRAY_MERGE });
    return deepmerge.all(objs, { arrayMerge: ARRAY_MERGE });
};

/**
 * Used specifically by JSONFileMasks
 */
const maskChannelMerge = (obj1, obj2, merge_arrays) => {
    return objMerge(obj1, obj2, {
        custom_merge: (o1, o2, key, path) => {
            if(!Array.isArray(o1) || !Array.isArray(o2)) return;
            
            if(Array.isArray(merge_arrays)) {
                if(merge_arrays.find(e => path.includes(e))) return o1.concat(o2);
            } else {
                for(let key in merge_arrays) {
                    if(path.includes(key)) return merge_arrays[key](o1, o2);
                }
            }
        }
    })
};
const maskMerge = (arr, overwrite_arrays) => {
    return objMergeAll(arr, {
        custom_merge: (o1, o2, key, path) => {
            // console.log(overwrite_arrays, path, o1, o2);
            if(!Array.isArray(o1) || !Array.isArray(o2)) return;
            
            if(overwrite_arrays.find(e => path.includes(e))) {
                return o2;
            }
        },
        array_merge: (o1, o2) => {
            if(Array.isArray(o1) && Array.isArray(o2)) return o1.concat(o2);
            else if(Array.isArray(o1)) return o1.concat([o2]);
            else return o2.concat([o1]);
        }
    })
};

export default detachObj;
export {
    detachMerge,
    detachObj,
    maskChannelMerge,
    maskMerge,
    PUSH_ONCE
};