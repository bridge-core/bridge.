let stack = new WeakMap();

export default class Stack {
    constructor(arr=[]) {
        stack.set(this, arr);
    }

    push(...el) {
        stack.get(this).unshift(...el);
    }
    pop() {
        return stack.get(this).shift();
    }
    peek() {
        return stack.get(this)[0];
    }
    show() {
        console.log(stack.get(this));
    }

    isEmpty() {
        return this.size == 0;
    }
    get size() {
        return stack.get(this).length;
    }
}