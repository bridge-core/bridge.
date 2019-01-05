import deepmerge from "deepmerge";


const ARRAY_MERGE = (target, source) => {
    let tmp = [];
    source.forEach(e => {
        if(typeof e != "object") tmp.push(e);
        else tmp.push(DETACH({}, e));
    })
    return tmp;
};

const DETACH = (...objs) => {
    if(objs.length == 1) return deepmerge({}, objs[0], { arrayMerge: ARRAY_MERGE });
    if(objs.length == 2) return deepmerge(objs[0], objs[1], { arrayMerge: ARRAY_MERGE });
    return deepmerge.all(objs, { arrayMerge: ARRAY_MERGE });
}

export default DETACH;