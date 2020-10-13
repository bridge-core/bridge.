/**
 * Wrapper around Provider.js to enable text auto-completions
 */
import Provider from './Provider'
import FileType from '../editor/FileType'
const DEF_PROVIDER = new Provider()

export default class TextProvider {
	static compile(line: string, filePath?: string, startState?: string) {
		if (filePath !== undefined) DEF_PROVIDER.validator(filePath)
		else if (startState !== undefined)
			DEF_PROVIDER.setStartState(startState)
		else
			throw new Error(
				'TextProvider needs either a filePath or a startState'
			)

		let path = FileType.transformTextSeparators(
			line.replace(/\//g, ''),
			filePath
		).split(/\s+/)
		path.pop()
		let strPath = path.join('/')

		let { object, value } = DEF_PROVIDER.get(
			strPath !== '' ? 'global/' + strPath : 'global'
		)

		return object.concat(value)
	}
}
