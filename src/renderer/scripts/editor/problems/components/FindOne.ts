//@ts-check
import CommonProblem, { ProblemConfig } from '../CommonProblem'
import JSONTree from '../../JsonTree'

export default class FindOne extends CommonProblem {
	search: string
	search_found = false

	constructor({ search, ...other }: ProblemConfig) {
		//@ts-ignore
		super(other)
		this.search = search
	}

	peek(node: JSONTree) {
		if (node.key === this.search) this.search_found = true
		else return false
		return true
	}
	found() {
		return this.search_found
	}
	reset() {
		super.reset()
		this.search_found = false
	}
}
