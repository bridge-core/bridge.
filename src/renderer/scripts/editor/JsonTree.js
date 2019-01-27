import Stack from "../utilities/Stack";
import Json from "./Json";

function getType(data) {
    if(Array.isArray(data)) return "array";
    return typeof data;
}

export default class JSONTree {
    constructor(key="", data="", parent, children=[], open=false) {
        this.key = key;
        this.data = data;
        this.children = children;
        this.open = open;
        this.type = "object";
        this.parent = parent;

        this.TreeIterator = class {
            constructor(tree) {
                this.stack = new Stack();
                this.descendAndPush(tree, 0);
            }
            next(max_depth) {
                let stack_e = this.stack.pop();
                if(this.hasNext()) this.descendAndPush(this.stack.peek().node, stack_e.step + 1, max_depth);
                return stack_e.node;
            }
            hasNext() {
                return !this.stack.isEmpty();
            }

            descendAndPush(root, step, max_depth=Infinity) {
                let current = root;

                //Go one layer back (next sibling)
                if(current && current.children[step] && step != 0) {
                    current = current.children[step];
                    this.stack.push({ node: current, step });
                    this.descendAndPush(current.children[0], 0);
                } else if(step == 0) {
                    //Go further down
                    while(current != undefined && this.stack.size < max_depth) {
                        this.stack.push({ node: current, step });
                        current = current.children[step];
                    }
                }
            }
        }
    }

    get(inp) {
        if(Array.isArray(inp) || typeof inp == "string") {
            let key;
            let i_arr = inp;
            if(typeof inp == "string") {
               i_arr = inp.split("/");

               if(i_arr[0] == "global") i_arr.shift();
               if(i_arr.length == 0) return this; 
            } 
            key = i_arr.shift();
            if(i_arr.length == 0 && this.data.replace(/\//g, "&slash;") == key) return this;
            
            
            for(let c of this.children) {
                if(c.key.replace(/\//g, "&slash;") == key) {
                    if(i_arr.length == 0) {
                        return c;
                    } else {
                        return c.get(i_arr);
                    }
                }
            }
        }
        else {
            throw new TypeError("Expected string, found " + typeof inp);
        }
    }
    add(child) {
        for(let c of this.children) {
            if(c.key == child.key) return this;
        }
        child.parent = this;
        if(!Number.isNaN(Number(child.key)) && this.children.length == 0) this.type = "array";
        console.log(this.type);
        
        this.children.push(child);
        return this;
    }
    find(child) {
        let i = 0;
        for(let c of this.children) {
            if(c.key == child.key) {
                return i;
            }

            i++;
        }
        return -1;
    }
    remove() {
        if(this.key == "global") return;
        let c = this.parent.children;
        for(let i = 0; i < c.length; i++) {
            if(c[i].key == this.key) {
                c.splice(i, 1);
                return;
            }
        }
    }
    edit(new_data) {
        if(!new_data) throw new Error("Data may not be undefined or null.")
        this.data = new_data;
    }
    openNode() {
        this.open = true;
        return this;
    }
    get is_array() {
        return this.children[0] && !Number.isNaN(Number(this.children[0].key));
    }
    get path() {
        if(!this.parent) return "global";
        return this.parent.path + "/" + this.key.replace(/\//g, "&slash;");
    }

    moveUp() {
        let a = this.parent.children;
        let me = this.parent.find(this);
        if(me == 0 || a.length < 1) return;

        let tmp = a[me];
        a[me] = a[me - 1];
        a[me - 1] = tmp;
    }
    moveDown() {
        let a = this.parent.children;
        let me = this.parent.find(this);
        if(me == a.length - 1) return;

        let tmp = a[me];
        a[me] = a[me + 1];
        a[me + 1] = tmp;
    }

    buildFromObject(data, first=true) {
        this.type = getType(data);

        if(first) this.open = true;
        
        if(typeof data == "object") {
            for(let key in data) {
                if(typeof data[key] != "function") this.children.push(new JSONTree(key, undefined, this).buildFromObject(data[key], false));
            }
        } else if(typeof data != "function") {
            this.data = data;
        }

        return this;
    }
    toJSON() {
        return Json.Format.toJSON(this);
    }

    iterator() {
        return new this.TreeIterator(this);
    }
    *[Symbol.iterator] () {
        let iterator = new this.TreeIterator(this);
        while(iterator.hasNext()) {
            yield iterator.next();
        }
    }
}