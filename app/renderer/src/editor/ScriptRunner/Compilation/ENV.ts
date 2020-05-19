import { ENV as vENV } from '../Validation/ENV'
import JSONTree from '../../JsonTree'
import TabSystem from '../../../TabSystem'
import { IDisposable } from '../../../Types/disposable'

export const ENV = (
	disposables: IDisposable[],
	Node: JSONTree,
	filePath = TabSystem.getCurrentFilePath()
) => ({
	...vENV(disposables, Node, filePath),
})
