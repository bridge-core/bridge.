import { TabSystem } from '../create'

export abstract class CommonTab<T> {
	protected fileContent: T | Promise<T>

	abstract save(): Promise<void>
	abstract saveAs(filePath: string): Promise<void>

	constructor(protected parent: TabSystem, protected filePath: string) {
		parent.add(this)
	}

	getFileContent() {
		return this.fileContent
	}
	close() {
		this.parent.close(this.parent.find(this))
	}
}
