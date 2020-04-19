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
	FileType: FileType.get(filePath),
	Tab: {
		setUnsaved: () => TabSystem.setCurrentUnsaved(),
	},
	get LightningCache() {
		return LightningCache.getCompiled()
	},
})
