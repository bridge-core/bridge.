import Stack from "../utilities/Stack";

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
                this.stack.show();
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
            if(i_arr.length == 0 && this.data == key) return this;
            
            
            for(let c of this.children) {
                if(c.key == key) {
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
        if(!Number.isNaN(Number(child.key)) && this.children.length == 0) this.type = "array";
        this.children.push(child);
        return this;
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
    get path() {
        if(!this.parent) return "global";
        return this.parent.path + "/" + this.key;
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