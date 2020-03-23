//@ts-check
import Snippets from '../../../windows/Snippets'
import ProblemIterator from './Problems'
import TabSystem from '../../TabSystem'
import { JSONAction, CommitType } from '../../TabSystem/CommonHistory'
import safeEval from 'safe-eval'
import JSONTree from '../JsonTree'

export interface ProblemConfig {
	error_message: string
	is_warning?: boolean
	fix?: FixConfig
	start?: string
	search?: string
	first?: string | string[]
	second?: string
	third?: string | string[]
}
export interface FixConfig {
	type: 'snippet' | 'script'
	display_text?: string
	name?: string
	run?: string
}

function run(code: string, node: JSONTree) {
	safeEval(code, {
		globalNode: TabSystem.getSelected().content,
		node,
		History,
		Unsaved,
	})
}
function History(type: CommitType, node: JSONTree, data: any) {
	TabSystem.getHistory().add(new JSONAction(type, node, data))
	TabSystem.setCurrentUnsaved()
}
function Unsaved() {
	TabSystem.setCurrentUnsaved()
}

export default class CommonProblem {
	private store_nodes: JSONTree[]
	is_warning: boolean
	error_message: string
	fix: any

	constructor({ error_message, is_warning, fix }: ProblemConfig) {
		if (error_message) this.error_message = error_message
		this.is_warning = is_warning
		this.store_nodes = []

		if (fix !== undefined) {
			if (fix.type === 'snippet') {
				this.fix = {
					function: () => {
						Snippets.insert(fix.name, true)
						ProblemIterator.repeatLast()
					},
					text: fix.display_text,
				}
			} else if (fix.type === 'script') {
				this.fix = {
					function: (context: JSONTree) => {
						run(fix.run, context)
						ProblemIterator.repeatLast()
					},
					text: fix.display_text,
				}
			}
		}
	}

	processPeek(node: JSONTree) {
		if (this.peek(node)) this.store_nodes.push(node)
	}

	/**
	 * Look at a node and process it
	 * @param {*} node
	 */
	peek(node: JSONTree) {
		return false
	}
	/**
	 * Report of a problem
	 */
	report() {
		if (this.found()) this.updateNodes()
		return {
			found: this.found(),
			error_message: this.error_message,
		}
	}
	found() {
		return false
	}

	updateNodes() {
		this.store_nodes.forEach(
			node =>
				(node.error = {
					is_warning: this.is_warning,
					show: true,
					message: this.error_message,
					fix: this.fix,
				})
		)
	}
	clearNodes() {
		this.store_nodes.forEach(node => (node.error = undefined))
	}

	/**
	 * Reset the component
	 */
	reset() {
		this.clearNodes()
		this.store_nodes = []
	}
}
