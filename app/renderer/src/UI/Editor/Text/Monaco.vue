<template>
	<div ref="monacoContainer" style="height:100%; width: 100%;" />
</template>

<script>
import * as monaco from 'monaco-editor'
import FileType from '../../../editor/FileType'
import { on } from '../../../AppCycle/EventSystem'

export default {
	name: 'Monaco',
	props: {
		value: String,
		extension: String,
		language: String,
		filePath: String,
		disposeOnUnmount: {
			default: false,
			type: Boolean,
		},
		readonly: Boolean,
	},
	data() {
		return {
			monacoEditor: null,
			disposables: [],
			URI: null,
		}
	},
	computed: {
		isDarkMode() {
			return this.$store.state.Appearance.is_dark_mode
		},
		fileType() {
			return FileType.get(this.filePath)
		},
		fontSize() {
			return this.$store.state.Settings.file_font_size || '14px'
		},
		fontFamily() {
			return this.$store.state.Settings.file_font_family || '14px'
		},
	},
	mounted() {
		monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
			target: monaco.languages.typescript.ScriptTarget.ESNext,
			allowNonTsExtensions: true,
			noLib: true,
		})

		this.URI = monaco.Uri.file(this.filePath)
		const currentModel =
			monaco.editor.getModel(this.URI) ||
			monaco.editor.createModel(this.value, this.language, this.URI)
		this.monacoEditor = monaco.editor.create(this.$refs.monacoContainer, {
			theme: this.isDarkMode ? 'bridge-dark' : 'bridge-light',
			value: this.value,
			roundedSelection: false,
			autoIndent: 'full',
			fontSize: this.fontSize,
			fontFamily: this.fontFamily,
			model: currentModel,
			readOnly: this.readonly,
		})
		//TODO: Open parts of the custom component in a new JSON editor tab
		// if (this.fileType === 'custom_component')
		// 	this.disposables.push(
		// 		this.monacoEditor.addAction({
		// 			id: 'edit-as-json',
		// 			label: 'Edit as JSON',
		// 			contextMenuGroupId: '1_modification',
		// 			run: () => {},
		// 		})
		// 	)

		currentModel.onDidChangeContent(() => {
			this.$emit('input', currentModel.getValue())
		})

		this.disposables.push(on('bridge:onResize', () => this.onResize()))

		setTimeout(this.onResize, 100)
	},
	destroyed() {
		this.disposables.forEach(dis => dis.dispose())
		if (this.disposeOnUnmount) monaco.editor.getModel(this.URI).dispose()
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
		fontSize(val) {
			this.monacoEditor.updateOptions({
				fontSize: this.fontSize,
			})
		},
		fontFamily(val) {
			this.monacoEditor.updateOptions({
				fontFamily: this.fontFamily,
			})
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
