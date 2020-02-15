export default class Stack<T> {
	private stack: T[] = []
	constructor(arr: T[] = []) {
		this.stack = arr
	}

	push(...el: T[]) {
		this.stack.unshift(...el)
	}
	pop() {
		return this.stack.shift()
	}
	peek() {
		return this.stack[0]
	}

	isEmpty() {
		return this.size == 0
	}
	get size() {
		return this.stack.length
	}
}
