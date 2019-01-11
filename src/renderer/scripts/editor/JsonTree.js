import Stack from "../utilities/Stack";

export default class JSONTree {
    constructor(content={}, children=[], opened=false) {
        this.children = children;
        this.content = content;
        this.opened = false;
        this.TreeIterator = class {
            constructor(tree) {
                this.stack = new Stack();
                this.descendAndPush(tree, 0);
            }
            next() {
                let content = this.stack.peek().node;
                this.descendAndPush(content, this.stack.pop().step + 1);
                return content;
            }
            hasNext() {
                return !this.stack.isEmpty();
            }

            descendAndPush(root, step) {
                let current = root;

                if(step == 0) {
                    while(current != undefined) {
                        this.stack.push({ node: current, step });
                        current = root.children[step];
                    }
                } else {
                    this.stack.push({ node: current, step });
                    this.descendAndPush(root.children[step], 0);
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
    iterator() {

    }

    *[Symbol.iterator] () {
        let iterator = new this.TreeIterator(this);
        while(iterator.hasNext()) {
            yield iterator.next();
        }
    }
}