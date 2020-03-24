//@ts-check
import CommonProblem, { ProblemConfig } from '../CommonProblem'
import JSONTree from '../../JsonTree'

export default class ChildMustStartWith extends CommonProblem {
	problem_found = false
	search: string
	start: string

	constructor({ search, start, ...other }: ProblemConfig) {
		//@ts-ignore
		super(other)
		this.search = search
		this.start = start
	}

	peek(node: JSONTree) {
		if (node.parent !== undefined && node.parent.key === this.search) {
			if (!node.key.startsWith(this.start)) {
				this.problem_found = true
				return true
			}
		}
		return false
	}
	found() {
		return this.problem_found
	}
	reset() {
		super.reset()
		this.problem_found = false
	}
}
