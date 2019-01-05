import deepmerge from "deepmerge";


const ARRAY_MERGE = (target, source) => {
    let tmp = [];
    source.forEach(e => {
        if(typeof e != "object") tmp.push(e);
        else tmp.push(DETACH({}, e));
    })
    return tmp;
};

const DETACH = (obj1, obj2) => {
    return deepmerge(obj1, obj2, { arrayMerge: ARRAY_MERGE })
}

export default DETACH;