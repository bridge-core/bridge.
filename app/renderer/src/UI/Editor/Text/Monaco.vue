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
		filePath: String,
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
		monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
			target: monaco.languages.typescript.ScriptTarget.ESNext,
			allowNonTsExtensions: true,
		})

		const URI = monaco.Uri.parse(`file:///${this.filePath}`)
		const currentModel =
			monaco.editor.getModel(URI) ||
			monaco.editor.createModel(this.value, this.language, URI)
		this.monacoEditor = monaco.editor.create(this.$refs.monacoContainer, {
			theme: this.isDarkMode ? 'bridge-dark' : 'bridge-light',
			value: this.value,
			language: this.language,
			roundedSelection: false,
			autoIndent: 'full',
			model: currentModel,
		})

		console.log(currentModel)
		currentModel.onDidChangeContent(() => {
			console.log('TESTS')
			this.$emit('input', currentModel.getValue())
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
