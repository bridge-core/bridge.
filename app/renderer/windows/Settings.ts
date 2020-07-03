import TabWindow from '../src/UI/Windows/Common/TabWindow'
import Store from '../store/index'
import SETTINGS from '../store/Settings'
import { BASE_PATH, LOCAL_STATE_PATH } from '../src/constants'
import EventBus from '../src/EventBus'
import fs from 'fs'
import AddSnippetWindow from './AddSnippet'
import Snippets from './Snippets'
import { ipcRenderer, remote } from 'electron'
import ConfirmWindow from '../src/UI/Windows/Common/Confirm'
import ThemeManager from '../src/editor/Themes/ThemeManager'
import ProjectConfig from '../src/Project/Config'
import { uuid } from '../src/Utilities/useAttr'
import FontList from 'font-list'
import { DEV_MENU } from '../src/UI/Toolbar/setupDefaults'
import { LoadedProjects } from '../src/UI/ProjectScreen/state'
import { loadProjects } from '../src/UI/ProjectScreen/load'
import { basename } from 'path'
import { trigger } from '../src/AppCycle/EventSystem'

class ReactiveListEntry {
	type = 'card'
	below_content: any[]

	constructor(
		text: string,
		parent: SettingsWindow,
		watch_key: string,
		index: number
	) {
		this.below_content = [
			{
				text: text,
			},
			{
				type: 'space',
			},
			{
				type: 'icon-button',
				text: 'mdi-delete',
				color: 'error',
				only_icon: true,
				action: () => {
					Snippets.removeSnippet(parent.data[watch_key][index])
					parent.save({
						[watch_key]: parent.data[watch_key].filter(
							(_: any, i: number) => index !== i
						),
					})
					parent.select(undefined, true)
				},
			},
		]
	}
}
class ReactiveList {
	parent: SettingsWindow
	watch_key: string

	constructor(parent: SettingsWindow, watch_key: string) {
		this.parent = parent
		this.watch_key = watch_key
	}
	get content() {
		let arr = this.parent.data[this.watch_key]
		let res = []
		for (let i = 0; i < arr.length; i++) {
			res.push(
				new ReactiveListEntry(
					arr[i].display_name,
					this.parent,
					this.watch_key,
					i
				)
			)
			res.push({ text: '\n' })
		}
		return res
	}
	get() {
		return {
			type: 'container',
			content: this.content,
		}
	}
}

class ReactiveSwitch {
	[x: string]: any
	type = 'switch'

	constructor(
		parent: SettingsWindow,
		watch_key: string,
		def: any,
		onChange?: (state: boolean) => void
	) {
		this.input = parent.data[watch_key]
		for (let key in def) {
			this[key] = def[key]
		}

		this.action = (val: boolean) => {
			this.input = val
			parent.data[watch_key] = val
			parent.save()
			if (onChange) onChange(val)
		}
	}
}

class ReactiveInput {
	[x: string]: any
	type = 'input'

	constructor(parent: SettingsWindow, watch_key: string, def: any) {
		this.input = parent.data[watch_key]
		for (let key in def) {
			this[key] = def[key]
		}

		this.action = (val: string) => {
			this.input = val
			parent.data[watch_key] = val
			parent.save()
		}
	}
}

class ReactiveDropdown {
	[x: string]: any
	type: 'autocomplete' | 'select' | 'loader'

	constructor(
		parent: SettingsWindow,
		watch_key: string,
		options: string[] | Promise<string[]>,
		def: any,
		cb?: (a: string) => any
	) {
		if (options instanceof Promise) {
			this.type = 'loader'
			options.then(value => {
				this.type = value.length > 5 ? 'autocomplete' : 'select'
				this.options = value
				parent.update()
			})
		} else {
			this.type = options.length > 5 ? 'autocomplete' : 'select'
			this.options = options
		}
		this.input = parent.data[watch_key]

		this.is_box = true
		for (let key in def) {
			this[key] = def[key]
		}

		this.action = (val: string) => {
			this.input = val
			parent.data[watch_key] = val
			parent.save()
			if (typeof cb == 'function') cb(val)
		}
	}
}

export default class SettingsWindow extends TabWindow {
	data: any

	constructor() {
		super(
			'Settings',
			{ is_persistent: false },
			'bridge.core.settings_window.'
		)
		this.data = SETTINGS.load()

		this.addTab({
			sidebar_element: {
				icon: 'mdi-code-braces',
				title: 'Editor',
			},
			content: [
				{
					color: 'grey',
					text: '\nExperimental',
				},
				new ReactiveSwitch(this, 'bridge_predictions', {
					color: 'primary',
					text: 'bridge. Predictions',
					key: `settings.editor.tab.bridge_predictions.${Math.random()}`,
				}),
				{
					color: 'grey lighten-1',
					text:
						'This experimental feature changes the classic way of editing JSON to a different approach with only two inputs. "bridge." will try to predict the node type you want to insert.\n',
				},

				{
					color: 'grey',
					text: '\nGeneral',
				},
				// new ReactiveSwitch(this, 'hide_file_toolbar', {
				// 	color: 'primary',
				// 	text: 'Hide File Toolbar',
				// 	key: `settings.editor.tab.hide_file_toolbar.${Math.random()}`,
				// }),
				new ReactiveSwitch(this, 'is_alternative_append_with_copy', {
					color: 'primary',
					text: 'Alternative Paste: Append "_copy"',
					key: `settings.editor.tab.alternative_append_copy.${Math.random()}`,
				}),
				new ReactiveSwitch(this, 'use_tabs', {
					color: 'primary',
					text: 'Use Tabs',
					key: `settings.editor.tab.tabs.${Math.random()}`,
				}),
				new ReactiveSwitch(this, 'line_wraps', {
					color: 'primary',
					text: 'Word Wrap',
					key: `settings.editor.tab.line_wraps.${Math.random()}`,
				}),
				new ReactiveSwitch(this, 'disable_node_dragging', {
					color: 'primary',
					text: 'Disable Node Dragging',
					key: `settings.editor.tab.disable_node_dragging.${Math.random()}`,
				}),
				new ReactiveSwitch(this, 'focus_json_inputs', {
					color: 'primary',
					text: 'Auto-Focus Inputs',
					key: `settings.editor.tab.focus_json_inputs.${Math.random()}`,
				}),
				new ReactiveSwitch(this, 'auto_scroll_json', {
					color: 'primary',
					text: 'Auto-Scroll',
					key: `settings.editor.tab.focus_json_inputs.${Math.random()}`,
				}),
				new ReactiveSwitch(this, 'cade_node_click', {
					color: 'primary',
					text: 'Only Select Node On Click',
					key: `settings.editor.tab.cade_node_click.${Math.random()}`,
				}),
				new ReactiveSwitch(this, 'open_all_nodes', {
					color: 'primary',
					text: 'Open All Nodes',
					key: `settings.editor.tab.open_all_nodes.${Math.random()}`,
				}),

				{
					color: 'grey',
					text: '\nAuto-Completions',
				},
				new ReactiveSwitch(this, 'auto_completions', {
					color: 'primary',
					text: 'Provide Auto-Completions',
					key: `settings.editor.tab.auto_completions.${Math.random()}`,
				}),
				new ReactiveSwitch(this, 'auto_fill_inputs', {
					color: 'primary',
					text: 'Auto Fill Inputs',
					key: `settings.editor.tab.auto_fill_inputs.${Math.random()}`,
				}),

				{
					color: 'grey',
					text: '\nFile Validation',
				},
				new ReactiveSwitch(this, 'run_error_detection', {
					color: 'primary',
					text: 'Error Detection',
					key: `settings.editor.tab.error_icon_indicator.${Math.random()}`,
				}),
				new ReactiveSwitch(this, 'error_icon_indicator', {
					color: 'primary',
					text: 'Error Icon Indicator',
					key: `settings.editor.tab.error_icon_indicator.${Math.random()}`,
				}),
				new ReactiveSwitch(this, 'error_auto_fix', {
					color: 'primary',
					text: 'Error Auto-fix',
					key: `settings.editor.tab.error_auto_fix.${Math.random()}`,
				}),
			],
		})
		this.addTab({
			sidebar_element: {
				icon: 'mdi-attachment',
				title: 'Snippets',
			},
			content: [
				{
					color: 'grey',
					text: '\nInsertion Scope',
				},
				new ReactiveDropdown(
					this,
					'snippet_scope',
					['Default', 'Selected Node'],
					{
						text: 'Choose a scope...',
						key: `settings.editor.tab.snippet_scope.${Math.random()}`,
					}
				),
				{
					color: 'grey',
					text: '\nCustom Snippets\n',
				},
				{
					type: 'icon-button',
					color: 'primary',
					text: 'mdi-plus',
					only_icon: true,
					action: () => new AddSnippetWindow(this),
				},
				{
					type: 'divider',
				},
				{
					text: '\n',
				},
				() => new ReactiveList(this, 'custom_snippets').get(),
			],
		})
		this.addTab({
			sidebar_element: {
				icon: 'mdi-folder-multiple',
				title: 'Explorer',
			},
			content: [
				{
					text: '\nChosen Default Directory:\n',
				},
				{
					text: LOCAL_STATE_PATH + '\n',
					color: 'grey',
				},
				{
					type: 'button',
					text: 'Default Directory',
					color: 'error',
					is_rounded: false,
					action: () => {
						new ConfirmWindow(
							() => {
								ipcRenderer.send('chooseDefaultDirectory')
							},
							() => {},
							'Setting a new default directory requires an app restart. Make sure to save your progress first!',
							{
								cancel_text: 'Cancel',
								confirm_text: 'Continue',
							}
						)
					},
				},
				{
					color: 'grey',
					text: '\n\nDefault Project',
				},
				new ReactiveDropdown(
					this,
					'default_project',
					LoadedProjects.map(({ projectPath }) =>
						basename(projectPath)
					),
					{
						text: 'Choose a default project...',
						key: `settings.editor.tab.default_project.${Math.random()}`,
					}
				),
				new ReactiveSwitch(
					this,
					'load_packs_from_worlds',
					{
						color: 'primary',
						text: 'Load packs from world files',
						key: `settings.explorer.tab.load_packs_from_worlds.${Math.random()}`,
					},
					() => {
						this.close()
						loadProjects()
					}
				),
			],
		})
		this.addTab({
			sidebar_element: {
				icon: 'mdi-flower-tulip',
				title: 'Appearance',
			},
			content: [
				{
					color: 'grey',
					text: '\nGeneral',
				},
				new ReactiveSwitch(this, 'is_dark_mode', {
					color: 'primary',
					text: 'Dark Mode',
					key: `settings.appearance.tab.${Math.random()}`,
				}),
				new ReactiveSwitch(this, 'hide_data_next_to_nodes', {
					color: 'primary',
					text: 'Hide Data Next To Nodes',
					key: `settings.appearance.tab.hide_data_next_to_nodes.${Math.random()}`,
				}),
				{
					color: 'grey',
					text: '\nTheme',
				},
				{
					key: uuid(),
					type: 'autocomplete',
					is_box: true,
					color: 'primary',
					text: 'None',
					input: ProjectConfig.theme,
					options: [
						{ text: 'None', value: 'bridge.null' },
						...ThemeManager.local_theme_names,
					],
					action: (val: string) => {
						if (val != 'bridge.null') ThemeManager.applyTheme(val)
						ProjectConfig.setTheme(val)
						trigger('bridge:reloadPlugins')
					},
				},
				{
					key: `settings.editor.tab.appearance.global_theme`,
					type: 'autocomplete',
					is_box: true,
					color: 'primary',
					text: 'Choose a global theme...',
					input: this.data.global_theme,
					options: ThemeManager.global_theme_names,
					action: (val: string) => {
						this.data.global_theme = val
						ThemeManager.global_theme = val
						trigger('bridge:reloadPlugins')
						this.save()
					},
				},
				{
					color: 'grey',
					text: '\nUI Font',
				},
				new ReactiveDropdown(
					this,
					'ui_font_size',
					['10px', '12px', '14px', '16px', '18px', '20px'],
					{
						text: '14px',
						key: `settings.editor.tab.appearance.ui_font_size`,
					}
				),
				new ReactiveDropdown(
					this,
					'ui_font_family',
					FontList.getFonts().then(arr =>
						arr
							.concat(['monospace', 'Roboto', 'sans-serif'])
							.sort((a, b) => {
								if (a[0] === '"') a = a.substring(1, a.length)
								if (b[0] === '"') b = b.substring(1, b.length)

								return a.localeCompare(b)
							})
					),
					{
						text: 'Roboto',
						key: `settings.editor.tab.appearance.ui_font_family`,
					}
				),
				{
					type: 'button',
					text: 'Reset Font',
					color: 'default_button',
					action: () => {
						this.data.ui_font_family = undefined
						this.data.ui_font_size = undefined
						this.save()
						this.close()
					},
				},
				{
					color: 'grey',
					text: '\n\n\nFile Font',
				},
				new ReactiveDropdown(
					this,
					'file_font_size',
					['10px', '12px', '14px', '16px', '18px', '20px'],
					{
						text: '14px',
						key: `settings.editor.tab.appearance.file_font_size`,
					}
				),
				new ReactiveDropdown(
					this,
					'file_font_family',
					FontList.getFonts().then(arr =>
						arr
							.concat(['monospace', 'Roboto', 'sans-serif'])
							.sort((a, b) => {
								if (a[0] === '"') a = a.substring(1, a.length)
								if (b[0] === '"') b = b.substring(1, b.length)

								return a.localeCompare(b)
							})
					),
					{
						text: 'Roboto',
						key: `settings.editor.tab.appearance.file_font_family`,
					}
				),
				{
					type: 'button',
					text: 'Reset Font',
					color: 'default_button',
					action: () => {
						this.data.file_font_family = undefined
						this.data.file_font_size = undefined
						this.save()
						this.close()
					},
				},
				{
					text: '\n\n',
				},
			],
		})
		this.addTab({
			sidebar_element: {
				icon: 'mdi-cogs',
				title: 'Developer Mode',
			},
			content: [
				{
					text: '\n',
				},
				{
					type: 'button',
					text: 'Toggle Dev Tools',
					color: 'warning',
					is_block: true,
					action: () => ipcRenderer.send('toggleDevTools'),
				},
				{
					text: '\n',
				},
				{
					type: 'button',
					text: this.data.disable_hardware_acceleration
						? 'Enable Hardware Acceleration'
						: 'Disable Hardware Acceleration',
					color: this.data.disable_hardware_acceleration
						? 'success'
						: 'error',
					is_block: true,
					action: () => {
						new ConfirmWindow(
							() => {
								this.data.disable_hardware_acceleration = !this
									.data.disable_hardware_acceleration
								this.save()
								remote.app.relaunch()
								remote.app.quit()
							},
							() => {},
							'Disabling/enabling hardware acceleration requires an app restart. Make sure to save your progress first!',
							{
								cancel_text: 'Cancel',
								confirm_text: 'Continue',
							}
						)
					},
				},
				{
					text: '\n',
				},
				new ReactiveSwitch(
					this,
					'is_dev_mode',
					{
						text: 'Dev Mode',
						key: `settings.dev.tab.${Math.random()}`,
					},
					val => {
						if (val) DEV_MENU.add()
						else DEV_MENU.dispose()
					}
				),
				new ReactiveSwitch(this, 'has_error_pop_ups', {
					color: 'error',
					text: 'Error Pop-Up',
					key: `settings.error_pop_ups.tab.${Math.random()}`,
				}),
			],
		})

		this.update()
	}

	save(data = this.data) {
		Store.commit('setSettings', data)
		SETTINGS.save(data)
	}
}
