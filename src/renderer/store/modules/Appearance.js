import Vue from 'vue'
import { readJSONSync } from '../../scripts/Utilities/JsonFS'
import path from 'path'
import ThemeManager from '../../scripts/editor/ThemeManager'
const CM_NAME_MAP = readJSONSync(path.join(__static, 'data/cm_name_map.json'))

const state = {
	is_dark_mode: true,
	files: {
		'.html': 'mdi-language-html5',
		'.js': 'mdi-nodejs',
		'.json': 'mdi-json',
		'.md': 'mdi-markdown',
		'.pdf': 'mdi-file-pdf',
		'.png': 'mdi-file-image',
		'.txt': 'mdi-file-document-outline',
		'.xls': 'mdi-file-excel',
		'.lang': 'mdi-web',
	},
	color_theme: {
		dark: {
			property: {
				color: '#a6e22e',
			},
			keyword: {
				color: '#f92672',
			},
			definition: {
				color: '#fd971f',
			},
			atom: {
				color: '#ae81ff',
			},
			number: {
				color: '#ae81ff',
			},
			string: {
				color: '#e6db74',
			},
			variable: {
				color: '#9effff',
			},
			variable_strong: {
				color: '#9effff',
			},
			meta: {
				color: 'white',
			},
			comment: {
				color: '#75715e',
			},
		},
		light: {
			property: {
				color: 'black',
			},
			keyword: {
				color: '#5A5CAD',
			},
			definition: {
				text_decoration: 'underline',
			},
			atom: {
				color: '#6C8CD5',
			},
			number: {
				color: '#164',
			},
			string: {
				color: 'red',
			},
			variable: {
				color: 'black',
			},
			variable_strong: {
				color: 'black',
			},
			meta: {
				color: 'yellow',
			},
			comment: {
				color: '#0080FF',
			},
		},
	},
	options: {},
}

let STYLE_TAG = document.createElement('style')
document.head.appendChild(STYLE_TAG)

function applyTheme(theme, mode = 'dark') {
	let style = `.theme--${mode} .CodeMirror { color: ${
		mode === 'dark' ? 'white' : 'black'
	};}`
	for (let key in theme) {
		let { color, text_decoration, is_italic = false } = theme[key]

		style += `.theme--${mode} span.cm-${CM_NAME_MAP[key] || key} {
            color: ${color || 'unset'};
            text-decoration: ${text_decoration || 'none'};
            font-style: ${is_italic ? 'italic' : 'unset'};
        }\n`
	}
	return style
}

const mutations = {
	toggleDarkMode(state) {
		state.is_dark_mode = !state.is_dark_mode
	},
	setDarkMode(state, val) {
		state.is_dark_mode = val
	},
	setColorTheme(state, { light, dark, update_styles } = {}) {
		if (!update_styles) return
		if (ThemeManager.options.inherit_highlighter) {
			Vue.set(
				state.color_theme,
				'dark',
				Object.assign(state.color_theme.dark, dark || {})
			)
			Vue.set(
				state.color_theme,
				'light',
				Object.assign(state.color_theme.light, light || {})
			)
		} else {
			Vue.set(state.color_theme, 'dark', dark || {})
			Vue.set(state.color_theme, 'light', light || {})
		}

		document.head.removeChild(STYLE_TAG)
		STYLE_TAG.innerHTML =
			applyTheme(state.color_theme.dark) +
			applyTheme(state.color_theme.light, 'light') +
			(state.options.css || '')
		document.head.appendChild(STYLE_TAG)
	},
	setThemeOptions(state, opts) {
		Vue.set(state, 'options', opts)
	},
}

const actions = {}

export default {
	state,
	mutations,
	actions,
}
