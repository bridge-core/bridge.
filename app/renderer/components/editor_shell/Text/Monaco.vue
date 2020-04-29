<template>
	<div
		ref="monacoContainer"
		style="height:100%; width: 100%;"
		v-resize="onResize"
	/>
</template>

<script>
import * as monaco from 'monaco-editor'
export default {
	name: 'Monaco',
	props: {
		value: String,
	},
	data() {
		return {
			monacoEditor: null,
		}
	},
	mounted() {
		// Register a new language
		monaco.languages.register({ id: 'bridge-json' })
		monaco.languages.setLanguageConfiguration('bridge-json', {
			indentationRules: {
				increaseIndentPattern: /{/,
				decreaseIndentPattern: /}/,
			},
			autoClosingPairs: [{ open: '{', close: '}' }],
		})
		// Register a tokens provider for the language
		monaco.languages.setMonarchTokensProvider('bridge-json', {
			tokenizer: {
				root: [
					[/minecraft|bridge/, 'custom-error'],
					[/component_groups|components|events/, 'custom-notice'],
					[/format_version/, 'custom-info'],
					[/[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/, 'custom-date'],
					[/-\s*.+/, 'custom-string'],
				],
			},
		})
		// // Define a new theme that contains only rules that match this language
		// monaco.editor.defineTheme('bridge-theme-light', {
		// 	base: 'vs-dark',
		// 	inherit: false,
		// 	rules: [
		// 		{ token: 'custom-info', foreground: '5A5CAD' },
		// 		{
		// 			token: 'custom-error',
		// 			foreground: '5A5CAD',
		// 			fontStyle: 'bold',
		// 		},
		// 		{ token: 'custom-notice', foreground: '6C8CD5' },
		// 		{ token: 'custom-date', foreground: '008800' },
		// 		{ token: 'custom-string', foreground: 'FF0000' },
		// 	],
		// })
		// Register a completion item provider for the new language
		monaco.languages.registerCompletionItemProvider('bridge-json', {
			provideCompletionItems: (model, position) => {
				let textUntilPosition = model.getValueInRange({
					startLineNumber: 1,
					startColumn: 1,
					endLineNumber: position.lineNumber,
					endColumn: position.column,
				})
				let match = textUntilPosition.match(
					/(.|\n)*minecraft:entity\s*{\s+.*\s+components\s*{\s*/
				)
				if (!match) {
					return { suggestions: [] }
				}
				let suggestions = [
					{
						label: 'minecraft:attack',
						kind: monaco.languages.CompletionItemKind.Text,
						insertText: 'minecraft:attack',
					},
				]
				return { suggestions }
			},
		})
		this.monacoEditor = monaco.editor.create(this.$refs.monacoContainer, {
			theme: 'vs-dark',
			value: this.value,
			language: 'javascript',
			roundedSelection: false,
			autoIndent: 'full',
		})
		this.monacoEditor.getModel().onDidChangeContent(() => {
			this.$emit('input', this.monacoEditor.getModel().getValue())
		})
	},
	methods: {
		onResize() {
			if (this.monacoEditor) this.monacoEditor.layout()
		},
	},
}
</script>
