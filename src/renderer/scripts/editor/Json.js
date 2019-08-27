import saveEval from "safe-eval";
import JSONTree from "./JsonTree";
import ProblemIterator from "./problems/Problems";

function private_toJSON(tree, build_arrays, default_build_arrays=false) {
    if(tree.type !== "array" && tree.type !== "object") {
        return toCorrectType(tree.data);
    } else {
        if(build_arrays && tree.is_array) {
            let arr = [];
            tree.children.forEach(c => arr.push(private_toJSON(c.identity(), build_arrays)));
            return arr;
        } else {
            if(default_build_arrays && tree.children.length === 0) return [];
            let obj = {};
            tree.children.forEach(c => obj[c.key] = private_toJSON(c.identity(), build_arrays));
            return obj;
        }
    }
}

function getType(data) {
    if(Array.isArray(data)) return "array";
    return typeof data;
}

function toCorrectType(val) {
    if(val === "") return "";
    if(val == "true" || val == "false") return val == "true";
    if(!Number.isNaN(Number(val)) && typeof val != "boolean") return Number(val);
    if(val == "undefined") return undefined;
    return val;
}

function parse(string) {
    try {
        return saveEval(string);
    } catch(e) {
        console.error(e);
    }
}

export class Format {
    static toJSON(tree, build_arrays=true, default_build_arrays=false) {
        return private_toJSON(tree, build_arrays, default_build_arrays);
    }

    static toTree(obj) {
        let tree = new JSONTree("global").buildFromObject(obj);
        setTimeout(() => ProblemIterator.findProblems(tree), 10);
        return tree;
    }
}


export default {
    Format,
    parse,
    getType,
    toCorrectType
};