import { TabSystem } from '../main'
import { uuid } from '../../Utilities/useAttr'
import { Component } from 'vue'

export abstract class CommonTab<T> {
	protected fileContent: T | Promise<T>
	public uuid = uuid()
	// abstract uiComponent: Component
	abstract save(): Promise<void>
	abstract saveAs(filePath: string): Promise<void>
	select() {}
	unselect() {}

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
