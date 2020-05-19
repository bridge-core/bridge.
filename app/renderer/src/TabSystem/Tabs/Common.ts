import { TabSystem } from '../create'
import { uuid } from '../../Utilities/useAttr'

export abstract class CommonTab<T> {
	protected fileContent: T | Promise<T>
	public uuid = uuid()

	abstract save(): Promise<void>
	abstract saveAs(filePath: string): Promise<void>
	abstract select(): void
	abstract unselect(): void

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
