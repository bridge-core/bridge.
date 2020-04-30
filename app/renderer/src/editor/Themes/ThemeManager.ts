import { readJSONSync } from '../../Utilities/JsonFS'
import path from 'path'
import EventBus from '../../EventBus'
import ProjectConfig from '../../Project/Config'
import Store from '../../../store/index'
import fs from 'fs'
import deepmerge from 'deepmerge'
import { defineMonacoTheme } from './Monaco'

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
	[c: string]: string | IThemeHighlighter
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
	static current_theme: string
	static options: IThemeOptions

	static get theme_names() {
		let theme_names = []
		for (let id in this.themes) {
			theme_names.push({ text: this.themes[id].name, value: id })
		}
		for (let id in this.plugin_themes) {
			theme_names.push({ text: this.plugin_themes[id].name, value: id })
		}
		return theme_names.sort()
	}

	static addTheme({ id, ...theme }: { id: string; [other: string]: any }) {
		if (!id)
			return console.error(
				"No valid ID provided for theme. IDs may not be 'falsy'"
			)
		if (theme.definition.dark === undefined) theme.definition.dark = {}
		if (theme.definition.light === undefined) theme.definition.light = {}

		this.plugin_themes[id] = theme
	}

	static applyTheme(id: string) {
		this.current_theme = id
		const theme = this.themes[id] || this.plugin_themes[id] || {}

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
			definition: { dark, light },
		}: ITheme = deepmerge(this.themes['bridge.default.theme'], theme)

		if (!inherit_highlighter) {
			if (theme.definition.dark.highlighter)
				dark.highlighter = theme.definition.dark.highlighter
			if (theme.definition.light.highlighter)
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
		try {
			this.applyTheme(await ProjectConfig.theme)
		} catch (err) {
			this.applyTheme('bridge.default.theme')
		}
	}

	static reset() {
		this.plugin_themes = []
	}
}
