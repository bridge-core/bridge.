/**
 * Define context menu upon right clicking on a tab (TabSystem.vue)
 */

import TabSystem from '../../TabSystem'

export const getTabContextMenu = (tabIndex: number) => [
	{
		title: 'Close Tab',
		icon: 'mdi-close',
		action: () => {
			TabSystem.closeById(tabIndex)
		},
	},
	{
		title: 'Close All',
		icon: 'mdi-table-row',
		action: () => {
			let tabs = TabSystem.getCurrentTabs()
			for (let i = 0; i < tabs.length; i++) {
				if (!tabs[i].is_unsaved) {
					TabSystem.closeById(i)
					i--
				}
			}
		},
	},
	{ type: 'divider' },
	{
		title: 'Close Tabs to the Right',
		icon: 'mdi-chevron-right',
		action: () => {
			let tabs = TabSystem.getCurrentTabs()
			for (let i = tabIndex + 1; i < tabs.length; i++) {
				if (!tabs[i].is_unsaved) {
					TabSystem.closeById(i)
					i--
				}
			}
		},
	},
	{
		title: 'Close Other Tabs',
		icon: 'mdi-unfold-more-vertical',
		action: () => {
			let tabs = TabSystem.getCurrentTabs()
			for (let i = 0; i < tabs.length; i++) {
				if (!tabs[i].is_unsaved && tabIndex !== i) {
					TabSystem.closeById(i)
					i--
					tabIndex--
				}
			}
		},
	},
]
