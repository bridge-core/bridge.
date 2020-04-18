import { CommonTab } from './Tabs/Common'

export class TabSystem {
	private tabs: CommonTab<unknown>[] = []
	private selectedTab = 0

	get currentTab() {
		return this.tabs[this.selectedTab]
	}
	get hasTabs() {
		return this.tabs.length
	}

	add(tab: CommonTab<unknown>) {
		this.tabs.push(tab)
	}
	close(index: number) {
		this.tabs.splice(index, 1)
	}
	clear() {
		this.tabs = []
	}
	select(index: number) {
		this.selectedTab = index
	}
	find(tab: CommonTab<unknown>) {
		return this.tabs.findIndex(t => t === tab)
	}
}
