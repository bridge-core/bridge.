//@ts-check
import CommonProblem, { ProblemConfig } from '../CommonProblem'
import JSONTree from '../../JsonTree'

export default class NeedsThree extends CommonProblem {
	first_found = false
	second_found = false
	third_found = false
	first: string[]
	second: string
	third: string

	constructor({ first, second, third, ...other }: ProblemConfig) {
		//@ts-ignore
		super(other)

		if (Array.isArray(first)) this.first = first
		else this.first = [first]

		this.second = second

		if (Array.isArray(third)) this.third = third[0]
		else this.third = third
	}

	peek(node: JSONTree) {
		if (this.first.includes(node.key)) this.first_found = true
		else if (node.key === this.second) this.second_found = true
		else if (node.key === this.third) this.third_found = true
		else return false
		return true
	}
	found() {
		return !this.first_found || !this.second_found || !this.third_found
	}
	report() {
		if (!this.found()) return super.report()

		let old = this.error_message
		this.error_message = this.error_message.replace(
			/\$failure_name/g,
			!this.first_found
				? this.first.join(' or ')
				: !this.second_found
				? this.second
				: this.third
		)
		let res = super.report()
		this.error_message = old

		return res
	}
	reset() {
		super.reset()
		this.first_found = false
		this.second_found = false
		this.third_found = false
	}
}
