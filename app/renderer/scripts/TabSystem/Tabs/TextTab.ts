import { CommonTab } from './Common'
import { TabSystem } from '../create'
import { promises as fs } from 'fs'

export class TextTab extends CommonTab<string> {
	constructor(protected parent: TabSystem, protected filePath: string) {
		super(parent, filePath)
		this.fileContent = fs
			.readFile(filePath)
			.then(buffer => buffer.toString('utf-8'))
			.then(str => (this.fileContent = str))
	}

	async save() {
		await fs.writeFile(this.filePath, this.fileContent)
	}

	async saveAs(filePath: string) {
		await fs.writeFile(filePath, this.fileContent)
	}
}
