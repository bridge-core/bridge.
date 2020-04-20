import JSONTree from '../editor/JsonTree'
import FileType from '../editor/FileType'
import TabSystem from '../TabSystem'
import LightningCache from '../editor/LightningCache'

export function prepareRun(code: string) {
	try {
		return function(Bridge: unknown) {
			return eval(code)
		}
	} catch (err) {
		throw err
	}
}
export function run(code: string, env: unknown) {
	return prepareRun(code)(env)
}

export const ENV = (
	Node: JSONTree,
	filePath = TabSystem.getCurrentFilePath()
) => ({
	Node,
	get GlobalNode() {
		let currentNode = Node

		while (currentNode.parent) {
			currentNode = currentNode.parent
		}

		return currentNode
	},
	get FileType() {
		return FileType.get(filePath || TabSystem.getCurrentFilePath())
	},
	File: {
		usesEntity(identifier: string) {
			let globalNode = Node

			while (globalNode.parent) {
				globalNode = globalNode.parent
			}

			return (
				globalNode.get('#;bridge_node_skip;#/description/identifier')
					?.data === identifier ||
				globalNode.get(
					'#;bridge_node_skip;#/description/runtime_identifier'
				)?.data === identifier
			)
		},
	},
	Tab: {
		setUnsaved: () => TabSystem.setCurrentUnsaved(),
	},
	get LightningCache() {
		return LightningCache.getCompiled()
	},
})
