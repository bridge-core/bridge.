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
		extension: String,
		fileLanguage: String,
	},
	data() {
		return {
			monacoEditor: null,
		}
	},
	computed: {
		language() {
			if (this.fileLanguage) return this.fileLanguage
			if (this.extension === 'js') return 'javascript'
			if (this.extension === 'ts') return 'typescript'
			if (this.extension === 'mcfunction') return 'mcfunction'
			if (this.extension === 'molang') return 'molang'
			if (this.extension === 'lang') return 'lang'
			return 'plaintext'
		},
		isDarkMode() {
			return this.$store.state.Appearance.is_dark_mode
		},
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
		monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
			target: monaco.languages.typescript.ScriptTarget.ESNext,
			allowNonTsExtensions: true,
		})

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
			theme: this.isDarkMode ? 'bridge-dark' : 'bridge-light',
			value: this.value,
			language: this.language,
			roundedSelection: false,
			autoIndent: 'full',
		})
		this.monacoEditor.getModel().onDidChangeContent(() => {
			this.$emit('input', this.monacoEditor.getModel().getValue())
		})

		setTimeout(this.onResize, 100)
	},
	methods: {
		onResize() {
			if (this.monacoEditor) this.monacoEditor.layout()
		},
	},
	watch: {
		isDarkMode(val) {
			monaco.editor.setTheme(val ? 'bridge-dark' : 'bridge-light')
		},
	},
}
</script>

<style>
.monaco-action-bar {
	background: var(--v-menu-base) !important;
}
.action-item.focused > a {
	background: var(--v-primary-base) !important;
}
</style>
