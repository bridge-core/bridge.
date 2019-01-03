import JsonFormat from "./Json";

export default class Path {
    constructor(string_path) {
        this.path = string_path.split("/");
    }

    shift() {
        return this.path.shift();
    }
    pop() {
        return this.path.pop();
    }

    /**
     * Translates a string key into arr index for compiled JSON
     * @param {*} arr 
     * @param {*} key 
     */
    key(arr, key) {
        if(Array.isArray(arr)) {
            for(let i = 0; i < arr.length; i++) {
                if(arr[i].key == key) return i;
            }
            return arr.length;
        }
    }
    includes(arr, key) {
        if(Array.isArray(arr)) {
            for(let e of arr) {
                if(e.key == key) return true;
            }
            return false;
        }
    }

    walk(obj, is_compiled, path=this.path.concat([])) {
        if(!is_compiled) {
            let ref = obj;
        
            while(path.length > 0 && ref) {
                ref = obj[path.shift()];
            }
            return ref;
        } else {
            let ref = obj.data;

            while(path.length > 0 && ref) {
                ref = ref[this.key(ref, path.shift())].data;
            }
            return ref;
        }
    }
    keyWalk(obj, path=this.path.concat([])) {
        let ref = obj.data;
        
        while(path.length > 1 && ref) {
            ref = ref[this.key(ref, path.shift())].data;
        }

        try {
            let tmp = ref[this.key(ref, path.shift())]
            return tmp.key;
        } catch(e) {
            return ref;
        }
    }
    typeWalk(obj, path=this.path.concat([])) {
        let ref = obj.data;
        
        while(path.length > 1 && ref) {
            ref = ref[this.key(ref, path.shift())].data;
        }

        try {
            let tmp = ref[this.key(ref, path.shift())]
            return "object";
        } catch(e) {
            return "value";
        }
    }

    add(obj, key, val, is_compiled) {
        let place = this.walk(obj, is_compiled);
        if(!place) throw new Error("Cannot add something to undefined.");
        console.log(place, key);
        
        if(is_compiled) {
            if(this.includes(place, key)) {
                if(val == undefined) {
                    let i = this.key(place, key);
                    place[i].key = key;
                    console.log(place)
                } else {
                    place[this.key(place, key)] = {
                        key,
                        comment: "",
                        open: true,
                        type: JsonFormat.getType(val),
                        data: val
                    };
                }
            } else {
                if(Array.isArray(place)) {
                    place.push({
                        key,
                        comment: "",
                        open: true,
                        type: JsonFormat.getType(val),
                        data: val
                    });
                }
            }
        } else {
            obj[key] = val;
        }
    }
};