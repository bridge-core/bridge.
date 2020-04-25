import { ENV as vENV } from '../Validation/ENV'
import JSONTree from '../../JsonTree'
import TabSystem from '../../../TabSystem'

export const ENV = (
	Node: JSONTree,
	filePath = TabSystem.getCurrentFilePath()
) => ({
	...vENV(Node, filePath),
})
