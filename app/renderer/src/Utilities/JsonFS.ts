import fs from 'fs'
import cJSON from 'comment-json'
import FileType from '../editor/FileType'

export function readJSON(filePath: string): Promise<any> {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, (err, buffer) => {
			if (err) return reject(err)
			try {
				resolve(cJSON.parse(buffer.toString('utf-8'), undefined, true))
			} catch (e) {
				reject(e)
			}
		})
	})
}
export function writeJSON(
	filePath: string,
	data: any,
	beautify = false,
	fileVersion?: number
) {
	let toSave: string
	if (fileVersion === undefined) {
		toSave = JSON.stringify(data, null, beautify ? '\t' : undefined)
	} else {
		toSave = `${FileType.getCommentChar(
			filePath
		)}bridge-file-version: #${fileVersion}\n${JSON.stringify(
			data,
			null,
			beautify ? '\t' : undefined
		)}`
	}

	return new Promise((resolve, reject) => {
		fs.writeFile(filePath, toSave, err => {
			if (err) reject(err)
			else resolve()
		})
	})
}

export function readJSONSync(filePath: string) {
	return cJSON.parse(
		fs.readFileSync(filePath).toString('utf-8'),
		undefined,
		true
	)
}
export function writeJSONSync(filePath: string, data: any, beautify = false) {
	fs.writeFileSync(
		filePath,
		JSON.stringify(data, null, beautify ? '\t' : undefined)
	)
}
