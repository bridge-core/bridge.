import saveEval from "safe-eval";
import JSONTree from "./JsonTree";

function private_toJSON(tree) {
    if(tree.type != "array" && tree.type != "object") {
        return toCorrectType(tree.data);
    } else {
        if(!tree.is_array) {
            let obj = {};
            tree.children.forEach(c => obj[c.key] = private_toJSON(c));
            return obj;
        }
        else {
            let arr = [];
            tree.children.forEach(c => arr.push(private_toJSON(c)));
            return arr;
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
    static toJSON(tree) {
        return private_toJSON(tree);
    }

    static toTree(obj) {
        return new JSONTree("global").buildFromObject(obj);
    }
}


export default {
    Format,
    parse,
    getType
};