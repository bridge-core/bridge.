import { IAppMenu } from '../create'
import TabSystem from '../../../TabSystem'
import EventBus from '../../../EventBus'
import NodeShortcuts from '../../../editor/NodeShortcuts'

export const EditMenu: IAppMenu = {
	displayName: 'Edit',
	displayIcon: 'mdi-pen',
	elements: [
		{
			displayName: 'Selection',
			displayIcon: 'mdi-select',
			elements: [
				{
					displayName: 'Unselect',
					displayIcon: 'mdi-cancel',
					keyBinding: {
						key: 'escape',
					},
					onClick: () => TabSystem.setCurrentFileNav('global'),
				},
				{
					displayName: 'Select Parent',
					displayIcon: 'mdi-chevron-double-up',
					keyBinding: {
						key: 'p',
						ctrlKey: true,
					},
					onClick: () => {
						try {
							let p = TabSystem.getCurrentNavObj().parent
							if (p !== undefined)
								TabSystem.setCurrentFileNav(p.path)
						} catch {}
					},
				},
				{
					displayName: 'Select Next',
					displayIcon: 'mdi-chevron-down',
					keyBinding: {
						key: 'd',
						ctrlKey: true,
					},
					onClick: () => TabSystem.moveSelectionDown(),
				},
				{
					displayName: 'Select Previous',
					displayIcon: 'mdi-chevron-up',
					keyBinding: {
						key: 'e',
						ctrlKey: true,
					},
					onClick: () => TabSystem.moveSelectionUp(),
				},
			],
		},
		{
			displayName: 'JSON Nodes',
			displayIcon: 'mdi-file-tree',
			elements: [
				{
					displayName: 'Toggle Open',
					displayIcon: 'mdi-lock-open',
					keyBinding: {
						key: 'enter',
						ctrlKey: true,
					},
					onClick: () => TabSystem.toggleCurrentNode(),
				},
				{
					displayName: 'Toggle Open Children',
					displayIcon: 'mdi-lock-open-variant',
					keyBinding: {
						key: 'p',
						shiftKey: true,
						ctrlKey: true,
					},
					onClick: () =>
						TabSystem.getCurrentNavObj().toggleOpenDeep(),
				},
				{
					displayName: 'Move Down',
					displayIcon: 'mdi-chevron-down',
					keyBinding: {
						key: 'e',
						shiftKey: true,
						ctrlKey: true,
					},
					onClick: () => TabSystem.moveCurrentDown(),
				},
				{
					displayName: 'Move Up',
					displayIcon: 'mdi-chevron-up',
					keyBinding: {
						key: 'd',
						shiftKey: true,
						ctrlKey: true,
					},
					onClick: () => TabSystem.moveCurrentUp(),
				},
				{
					displayName: 'Comment/Uncomment',
					displayIcon: 'mdi-cancel',
					keyBinding: {
						key: 'i',
						ctrlKey: true,
					},
					onClick: () => {
						try {
							TabSystem.getCurrentNavObj().toggleIsActive()
							TabSystem.setCurrentUnsaved()
						} catch {}
					},
				},
			],
		},
		{
			displayName: 'Delete',
			displayIcon: 'mdi-delete',
			keyBinding: {
				key: 'backspace',
				ctrlKey: true,
				prevent: e =>
					e.tagName === 'INPUT' && (<HTMLInputElement>e).value !== '',
			},
			onClick: () => TabSystem.deleteCurrent(),
		},
		{
			isHidden: true,
			displayName: 'Delete',
			keyBinding: {
				key: 'delete',
				ctrlKey: true,
				prevent: e =>
					e.tagName === 'INPUT' && (<HTMLInputElement>e).value !== '',
			},
			onClick: () => TabSystem.deleteCurrent(),
		},
		{
			displayName: 'Undo',
			displayIcon: 'mdi-undo',
			keyBinding: {
				key: 'z',
				ctrlKey: true,
			},
			onClick: () => {
				if (!TabSystem.getHistory()?.undo()) EventBus.trigger('cmUndo')
			},
		},
		{
			displayName: 'Redo',
			displayIcon: 'mdi-redo',
			keyBinding: {
				key: 'y',
				ctrlKey: true,
			},
			onClick: () => {
				if (!TabSystem.getHistory()?.redo()) EventBus.trigger('cmRedo')
			},
		},

		{
			displayName: 'Copy',
			displayIcon: 'mdi-content-copy',
			keyBinding: {
				key: 'c',
				ctrlKey: true,
			},
			onClick: () => {
				if (
					document.activeElement.tagName === 'BODY' ||
					window.getSelection().toString() == ''
				) {
					NodeShortcuts.copy()
				} else {
					document.execCommand('copy')
				}
			},
		},
		{
			displayName: 'Cut',
			displayIcon: 'mdi-content-cut',
			keyBinding: {
				key: 'x',
				ctrlKey: true,
			},
			onClick: () => {
				if (
					document.activeElement.tagName === 'BODY' ||
					window.getSelection().toString() == ''
				) {
					NodeShortcuts.cut()
				} else {
					document.execCommand('cut')
				}
			},
		},
		{
			displayName: 'Paste',
			displayIcon: 'mdi-content-paste',
			keyBinding: {
				key: 'v',
				ctrlKey: true,
			},
			onClick: () => {
				if (!NodeShortcuts.execPaste()) {
					document.execCommand('paste')
				}
			},
		},
		{
			displayName: 'Alternative Paste',
			displayIcon: 'mdi-content-paste',
			keyBinding: {
				key: 'v',
				shiftKey: true,
				ctrlKey: true,
			},
			onClick: () => {
				if (!NodeShortcuts.execPaste(true)) {
					document.execCommand('paste')
				}
			},
		},
	],
}
