import { editor as Editor } from 'monaco-editor'
import { IThemeColors } from '../ThemeManager'
import { keyword } from 'color-convert'
import * as cssKeywords from 'color-name'

export function defineMonacoTheme(
	name: string,
	base: Editor.BuiltinTheme,
	def: IThemeColors
) {
	Editor.defineTheme(name, {
		base,
		inherit: true,
		colors: {
			'editor.background': convertColor(<string>def.background),
		},
		rules: [
			//@ts-ignore Token is not required
			{
				background: convertColor(<string>def.background),
			},
			...Object.entries(def.highlighter)
				.map(([token, { color, text_decoration, is_italic }]) => ({
					token: transformToken(token),
					foreground: convertColor(color),
					fontStyle: `${
						is_italic ? 'italic ' : ''
					}${text_decoration}`,
				}))
				.filter(({ foreground }) => foreground !== undefined),
		],
	})
}

function transformToken(token: string) {
	// if (token === 'definition') return 'identifier'
	if (token === 'property') return 'type.identifier'
	return token
}
function convertColor(color: string) {
	return color && !color.startsWith('#')
		? keyword.hex(color as keyof typeof cssKeywords)
		: color
}
