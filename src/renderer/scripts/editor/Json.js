import saveEval from "safe-eval";
import JSONTree from "./JsonTree";

function private_toInternal(obj) {
    if(typeof obj == "function") return;
    if(typeof obj != "object") return obj;
    
    let new_obj = [];
    for(let key in obj) {
        if(getType(obj[key]) != "function") {
            new_obj.push({
                key,
                open: false,
                comment: "",
                type: getType(obj[key]),
                data: private_toInternal(obj[key])
            });
        }
    }
    return new_obj;
}

function private_toJSON(obj) {
    if(typeof obj == "function" || !obj) return;
    if(obj.type != "object" && obj.type != "array") return obj.data;
    
    let new_obj = {};
    if(obj.type == "array") {
        new_obj = [];
        for(let el of obj.data) {
            new_obj.push(private_toJSON(el));
        }
    } else {
        for(let el of obj.data) {
            new_obj[el.key] = private_toJSON(el);
        }
    }
    
    return new_obj;
}

function getType(data) {
    if(Array.isArray(data)) return "array";
    return typeof data;
}

function parse(string) {
    try {
        return saveEval(string);
    } catch(e) {
        console.error(e);
    }
}

class Format {
    static toJSON(obj) {
        return private_toJSON(obj);
    }

    static toInternal(obj) {
        return { open: true, type: "object", data: private_toInternal(obj) };
    }

    static toTree(obj) {
        return new JSONTree().buildFromObject(obj);
    }
}


export default {
    Format,
    parse,
    getType
};