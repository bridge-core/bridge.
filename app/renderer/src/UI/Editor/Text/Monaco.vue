<template>
	<div ref="monacoContainer" style="height:100%; width: 100%;" v-resize="onResize" />
</template>

<script>
import * as monaco from 'monaco-editor'
import FileType from '../../../editor/FileType'

export default {
	name: 'Monaco',
	props: {
		value: String,
		extension: String,
		language: String,
		filePath: String,
	},
	data() {
		return {
			monacoEditor: null,
			disposables: [],
		}
	},
	computed: {
		isDarkMode() {
			return this.$store.state.Appearance.is_dark_mode
		},
		fileType() {
			return FileType.get(this.filePath)
		},
	},
	mounted() {
		monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
			target: monaco.languages.typescript.ScriptTarget.ESNext,
			allowNonTsExtensions: true,
			noLib: true,
		})

		const URI = monaco.Uri.parse(`file:///${this.filePath}`)
		const currentModel =
			monaco.editor.getModel(URI) ||
			monaco.editor.createModel(this.value, this.language, URI)
		this.monacoEditor = monaco.editor.create(this.$refs.monacoContainer, {
			theme: this.isDarkMode ? 'bridge-dark' : 'bridge-light',
			value: this.value,
			roundedSelection: false,
			autoIndent: 'full',
			model: currentModel,
		})
		//TODO: Open parts of the custom component in a new JSON editor tab
		if (this.fileType === 'custom_component')
			this.disposables.push(
				this.monacoEditor.addAction({
					id: 'edit-as-json',
					label: 'Edit as JSON',
					contextMenuGroupId: '1_modification',
					run: () => {},
				})
			)

		currentModel.onDidChangeContent(() => {
			this.$emit('input', currentModel.getValue())
		})

		setTimeout(this.onResize, 100)
	},
	destroyed() {
		this.disposables.forEach(dis => dis.dispose())
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
