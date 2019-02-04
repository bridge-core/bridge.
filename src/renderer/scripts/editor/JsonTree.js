import Stack from "../utilities/Stack";
import Json from "./Json";
import Provider from "./autoCompletions";
import PluginEnv from "../plugins/PluginEnv";
let PROVIDER = new Provider("");

function getType(data) {
    if(Array.isArray(data)) return "array";
    return typeof data;
}

export function changeProvider(new_path) {
    PROVIDER.validator(new_path);
}
export default class JSONTree {
    constructor(key="", data="", parent, children=[], open=false) {
        this.key = key + "";
        this.data = data + "";
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
    get is_array() {
        return this.children[0] && !Number.isNaN(Number(this.children[0].key));
    }
    get path() {
        if(!this.parent) return "global";
        return this.parent.path + "/" + this.key.replace(/\//g, "#;slash;#");
    }
    get parsed_key() {
        return this.key.replace(/\//g, "#;slash;#");
    }
    get next_sibling() {
        if(this.parent == undefined) return;
        return this.parent.children[this.parent.find(this) + 1];
    }
    get prev_sibling() {
        if(this.parent == undefined) return;
        return this.parent.children[this.parent.find(this) - 1];
    }
    get depth() {
        let deepest = 0;
        this.children.forEach(c => {
            let potential = c.depth + 1;
            if(deepest < potential) deepest = potential;
        });
        return deepest;
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
            if(i_arr.length == 0 && this.data.replace(/\//g, "#;slash;#") == key) return this;
            
            
            for(let c of this.children) {
                if(c.key.replace(/\//g, "#;slash;#") == key) {
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
    find(child) {
        let i = 0;
        for(let c of this.children) {
            if(c.parsed_key == child.parsed_key) {
                return i;
            }

            i++;
        }
        return -1;
    }
    add(child) {
        if(!this.is_array) {
            for(let c of this.children) {
                if(c.parsed_key == child.parsed_key) return c;
            }
            if(!Number.isNaN(Number(child.key)) && this.children.length == 0) this.type = "array";
        }

        child.parent = this;
        this.children.push(child);
        
        //PLUGIN HOOK
        PluginEnv.trigger("bridge:addedNode", {
            node: child
        });
        return child;
    }
    edit(new_data) {
        if(!new_data) throw new Error("Data may not be undefined or null.")
        this.data = new_data;
    }
    remove(key) {
        if(this.key == "global") return;
            let c = key ? this.children : this.parent.children;
            for(let i = 0; i < c.length; i++) {
                if(c[i].parsed_key == (key || this.parsed_key)) {
                    c.splice(i, 1);
                    return;
                }
            }
    }
    clone() {
        let clone = new JSONTree(this.key, this.data, this.parent, this.children, this.open);
        clone.type = this.type;
        return clone;
    }
    deepClone() {
        let clone = new JSONTree(this.key, this.data, this.parent, this.children.map(c => c.deepClone()), this.open);
        clone.type = this.type;
        return clone;
    }

    propose(path=this.path) {
        //console.log(PROVIDER.get(path), path)
        return PROVIDER.get(path);
    }   
    openNode() {
        this.open = true;
        return this;
    }
    

    //NAVIGATING & MOVING
    moveUp() {
        if(this.parent == undefined) return false;
        let a = this.parent.children;
        let me = this.parent.find(this);
        if(me == 0 || a.length < 1) return false;

        let tmp = a[me];
        a[me] = a[me - 1];
        a[me - 1] = tmp;
        return true;
    }
    moveDown() {
        if(this.parent == undefined) return false;
        let a = this.parent.children;
        let me = this.parent.find(this);
        if(me == a.length - 1) return false;

        let tmp = a[me];
        a[me] = a[me + 1];
        a[me + 1] = tmp;
        return true;
    }
    next(skip=false) {
        let next_sibling = this.next_sibling;

        if(!skip && this.open && this.children.length > 0) {
            return this.children[0];
        } else if(next_sibling != undefined) {
            return next_sibling;
        } else if(this.key != "global") {
            return this.parent.next(true);
        }
        return this;
    }
    previous() {
        let prev_sibling = this.prev_sibling;

        if(prev_sibling == undefined && this.key != "global") {
            return this.parent;
        } else if(this.key == "global") {
            return this;
        } else if(prev_sibling.open && prev_sibling.children.length > 0) {
            return prev_sibling.children[prev_sibling.children.length - 1];
        } else {
            return prev_sibling;
        }
    }

    //JSON <-> TREE
    buildFromObject(data, first=true) {
        if(data instanceof JSONTree) return data;
        this.type = getType(data);

        if(first) this.open = true;
        
        if(typeof data == "object") {
            for(let key in data) {
                if(typeof data[key] != "function" && key != "__ob__") this.add(new JSONTree(key, undefined, this)).buildFromObject(data[key], false);
            }
        } else if(typeof data != "function") {
            this.data = data + "";
        }

        return this;
    }
    toJSON(build_arrays=true) {
        return Json.Format.toJSON(this, build_arrays);
    }

    //ITERATOR
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