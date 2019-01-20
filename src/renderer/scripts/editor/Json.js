import saveEval from "safe-eval";
import JSONTree from "./JsonTree";

function private_toJSON(tree) {
    if(tree.type != "array" && tree.type != "object") {
        return toCorrectType(tree.data);
    } else {
        if(tree.type == "object") {
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
    // if(typeof obj == "function" || !obj) return;
    // if(obj.type != "object" && obj.type != "array") return obj.data;
    
    // let new_obj = {};
    // if(obj.type == "array") {
    //     new_obj = [];
    //     for(let el of obj.data) {
    //         new_obj.push(private_toJSON(el));
    //     }
    // } else {
    //     for(let el of obj.data) {
    //         new_obj[el.key] = private_toJSON(el);
    //     }
    // }
    
    // return new_obj;
}

function getType(data) {
    if(Array.isArray(data)) return "array";
    return typeof data;
}

function toCorrectType(val) {
    if(!Number.isNaN(Number(val))) return Number(val);
    if(val == "true" || val == "false") return val == "true";
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
    static toJSON(obj) {
        return private_toJSON(obj);
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