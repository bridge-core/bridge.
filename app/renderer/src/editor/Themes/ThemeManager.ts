import { readJSONSync } from '../../Utilities/JsonFS'
import path from 'path'
import EventBus from '../../EventBus'
import ProjectConfig from '../../Project/Config'
import Store from '../../../store/index'
import fs, { readFileSync } from 'fs'
import deepmerge from 'deepmerge'
import { defineMonacoTheme } from './Monaco'
import { createErrorNotification } from '../../AppCycle/Errors'

declare var __static: string

export interface ITheme {
	name: string
	options: IThemeOptions
	definition: {
		dark: IThemeColors
		light: IThemeColors
	}
}

export interface IThemeOptions {
	no_logo_display?: boolean
	inherit_highlighter?: boolean
	css?: string
}
export interface IThemeColors {
	highlighter: IThemeHighlighter
	monaco?: {
		[c: string]: string
	}
	[c: string]:
		| string
		| IThemeHighlighter
		| {
				[c: string]: string
		  }
}
export interface IThemeHighlighter {
	[id: string]: {
		color: string
		text_decoration: string
		is_italic: string
	}
}

function getDefaultThemes() {
	let files = fs.readdirSync(path.join(__static, 'themes'))
	let res: any = {}
	files.map(f => {
		const { id, ...theme } = readJSONSync(
			path.join(__static, `themes/${f}`)
		)
		if (theme?.options?.css) {
			ThemeManager.css.set(
				theme?.options?.css,
				readFileSync(
					path.join(__static, `styles/${theme?.options?.css}`)
				).toString('utf-8')
			)
		}
		res[id] = theme
	})

	try {
		let css_files = fs.readdirSync(path.join(__static, 'css'), {
			withFileTypes: true,
		})
		css_files.map(css_file => {
			if (css_file.isDirectory()) return

			ThemeManager.css.set(
				css_file.name,
				fs
					.readFileSync(path.join(__static, 'css', css_file.name))
					.toString('utf-8')
			)
		})
	} catch {}

	return res
}

export default class ThemeManager {
	static css = new Map<string, string>()
	static themes: any = getDefaultThemes()
	static plugin_themes: any = {}
	static plugin_themes_global: any = {}
	static current_theme: string
	static options: IThemeOptions
	static global_theme: string
	static local_theme: string

	static reloadDefaultThemes() {
		this.themes = getDefaultThemes()
	}

	static get local_theme_names() {
		let theme_names = []
		for (let id in this.themes) {
			if (!this.themes[id].isHidden)
				theme_names.push({
					text: this.themes[id]?.name ?? 'Unknown',
					value: id,
				})
		}
		for (let id in this.plugin_themes) {
			theme_names.push({
				text: this.plugin_themes[id]?.name ?? 'Unknown',
				value: id,
			})
		}
		for (let id in this.plugin_themes_global) {
			theme_names.push({
				text: this.plugin_themes_global[id]?.name ?? 'Unknown',
				value: id,
			})
		}
		return theme_names.sort()
	}
	static get global_theme_names() {
		let theme_names = []
		for (let id in this.themes) {
			if (!this.themes[id].isHidden)
				theme_names.push({
					text: this.themes[id]?.name ?? 'Unknown',
					value: id,
				})
		}
		for (let id in this.plugin_themes_global) {
			theme_names.push({
				text: this.plugin_themes_global[id]?.name ?? 'Unknown',
				value: id,
			})
		}
		return theme_names.sort()
	}

	static addTheme(
		{ id, ...theme }: { id: string; [other: string]: any },
		isGlobal: boolean
	) {
		if (!id) {
			createErrorNotification(
				new Error(
					`INVALID THEME: No valid ID provided for theme. IDs may not be 'falsy'`
				)
			)
			return {
				dispose: () => {},
			}
		}

		if (theme.definition.dark === undefined) theme.definition.dark = {}
		if (theme.definition.light === undefined) theme.definition.light = {}

		if (isGlobal) this.plugin_themes_global[id] = theme
		else this.plugin_themes[id] = theme

		return {
			dispose: () => {
				if (isGlobal) this.plugin_themes_global[id] = undefined
				else this.plugin_themes[id] = undefined
			},
		}
	}

	private static isHalloween() {
		const today = new Date(Date.now())
		const halloween = new Date(today.getUTCFullYear(), 9, 31)

		return (
			halloween.getMonth() === today.getMonth() &&
			halloween.getDate() === today.getDate()
		)
	}
	static lockThemeSettings() {
		return this.isHalloween()
	}

	static applyTheme(id = 'bridge.default.theme') {
		this.current_theme = id
		const theme =
			this.themes[id] ||
			this.plugin_themes[id] ||
			this.plugin_themes_global[id] ||
			{}

		//Load theme options
		this.options = theme.options || {}
		this.options.css = this.css.get(this.options.css)
		Store.commit('setThemeOptions', this.options)

		//Load theme
		if (id !== 'bridge.default.theme')
			EventBus.trigger('bridge:applyTheme', {
				update_styles: false,
				...this.themes['bridge.default.theme'],
			})

		const {
			options: { inherit_highlighter } = {},
			definition: { dark, light } = {
				dark: { highlighter: {} },
				light: { highlighter: {} },
			},
		}: ITheme = deepmerge(this.themes['bridge.default.theme'], theme)

		if (!inherit_highlighter) {
			if (theme.definition?.dark?.highlighter)
				dark.highlighter = theme.definition.dark.highlighter
			if (theme.definition?.light?.highlighter)
				light.highlighter = theme.definition.light.highlighter
		}

		defineMonacoTheme('bridge-dark', 'vs-dark', dark ?? { highlighter: {} })
		defineMonacoTheme('bridge-light', 'vs', light ?? { highlighter: {} })

		EventBus.trigger('bridge:applyTheme', {
			update_styles: true,
			...theme,
		})
	}

	static async loadTheme() {
		// If we haven't set the global theme yet, get it from the settings.
		// If settings has no global theme, this.applyTheme will use bridge.default.theme which works nicely
		this.global_theme = this.global_theme
			? this.global_theme
			: Store.state.Settings.global_theme

		//Halloween easter egg
		if (this.isHalloween())
			return this.applyTheme('bridge.easterEgg.halloween')

		try {
			// Regardless of what theme is chosen, save what the local theme is for the settings menu to reference
			this.local_theme = await ProjectConfig.theme

			this.applyTheme(
				// If the local theme is "None", use the global theme.
				this.local_theme === 'bridge.null'
					? this.global_theme
					: this.local_theme
			)
		} catch {
			this.applyTheme('bridge.default.theme')
		}
	}
}
