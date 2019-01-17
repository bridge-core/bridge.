import Stack from "../utilities/Stack";

export default class JSONTree {
    constructor(content="", children=[], opened=false, parent) {
        this.children = children;
        this.content = content;
        this.opened = opened;
        this.parent = parent;
        this.TreeIterator = class {
            constructor(tree) {
                this.stack = new Stack();
                this.descendAndPush(tree, 0);
                this.stack.show();
            }
            next() {
                let stack_e = this.stack.pop();
                if(this.hasNext()) this.descendAndPush(this.stack.peek().node, stack_e.step + 1);
                return stack_e.node;
            }
            hasNext() {
                return !this.stack.isEmpty();
            }

            descendAndPush(root, step) {
                let current = root;

                if(current && current.children[step] && step != 0) {
                    current = current.children[step];
                    this.stack.push({ node: current, step });
                    this.descendAndPush(current.children[0], 0);
                } else if(step == 0) {
                    while(current != undefined) {
                        this.stack.push({ node: current, step });
                        current = current.children[step];
                    }
                }
            }
        }
    }

    add(...children) {
        this.children.push(children);
    }
    edit(new_content) {
        if(!new_content) throw new Error("Content may not be undefined or null.")
        this.content = new_content;
    }
    buildFromObject(data) {
        if(typeof data == "object") {
            for(let key in data) {
                this.children.push(new JSONTree(key, undefined, undefined, this).buildFromObject(data[key]));
            }
        } else if(typeof data != "function") {
            this.content = data;
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