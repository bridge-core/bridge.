import deepmerge from "deepmerge";


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
const overwriteMerge = (objs, merge_arrays) => {
    return deepmerge.all(objs, {
        arrayMerge: ARRAY_OVERWRITE,
        customMerge: (key) => {
            if(merge_arrays.includes(key)) return (target, source) => source.concat(target);
        }
    });
};

export default detachObj;
export {
    detachMerge,
    detachObj,
    overwriteMerge
};