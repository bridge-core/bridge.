<template>
	<div
		:style="{
			position: 'relative',
			top: '-7px',
			fontSize: $store.state.Settings.file_font_size || '14px',
			fontFamily:
				$store.state.Settings.file_font_family || 'Roboto, sans-serif',
			height: `${available_height}px`,
		}"
	>
		<v-container v-if="file_viewer === 'image'">
			<img class="image" :src="image" style="max-width: 100%;" />
		</v-container>
		<audio-player v-else-if="file_viewer === 'audio'" :src="audio" />
		<model-editor
			v-else-if="file_viewer === 'model'"
			:file_path="file.file_path"
			:available_height="available_height"
			available_width="100%"
		/>
		<json-error-screen
			v-else-if="file_viewer === 'json' && jsonObject == 'error'"
		/>
		<!-- <json-editor-main
			v-else-if="file_viewer === 'json'"
			:compiled="file.is_compiled"
			:tab_id="tab_id"
			:object="jsonObject"
			:available_height="available_height - 6"
			:uuid="use_uuid"
			:current_file_path="file.file_path"
			:is_immutable="file.is_immutable"
			:is_active="is_active"
		/> -->
		<JSONEditor
			v-else-if="file_viewer === 'json'"
			:json="jsonObject"
			:availableHeight="available_height - 4"
			:language="getLanguage(file.file_path)"
		/>
		<TextEditor
			v-else
			v-model="content_as_string"
			:extension="extension"
			:filePath="file.file_path"
		/>
	</div>
</template>

<script>
import JSONEditor from './JSON/Main'
import JsonEditorMain from './JsonEditor/Main'
import JsonErrorScreen from './JsonErrorScreen'

import cJSON from 'comment-json'
import TabSystem from '../../TabSystem'
import EventBus from '../../EventBus'
import TextProvider from '../../autoCompletions/TextProvider'
import DataUrl from 'dataurl'
import AudioPlayer from './AudioPlayer'
import FileType from '../../editor/FileType'
import ModelEditor from './Model/Main'
import TextEditor from './Text/Monaco'
import { basename } from 'path'

export default {
	name: 'file-manager',
	components: {
		JSONEditor,
		JsonEditorMain,
		JsonErrorScreen,
		AudioPlayer,
		ModelEditor,
		TextEditor,
	},
	props: {
		file: Object,
		available_height: Number,
		tab_id: Number,
		uuid: String,
		is_active: Boolean,
	},
	data() {
		return {
			alias: {
				js: 'javascript',
				func: 'mcfunction',
				html: 'text/html',
			},
		}
	},
	computed: {
		file_viewer() {
			let data = FileType.getData(this.file.file_path)
			if (data !== undefined && data.file_viewer !== undefined)
				return data.file_viewer
			else if (this.extension === 'json') return 'json'
			else if (this.extension === 'png' || this.extension === 'tga')
				return 'image'
			else if (this.extension === 'ogg') return 'audio'
			return 'text'
		},
		extension() {
			if (this.file)
				return this.file.file_name
					.split('.')
					.pop()
					.toLowerCase()
		},
		use_uuid() {
			return `${this.uuid}-${Math.random()})`
		},

		//FILE CONTENT
		image() {
			this.$store.commit('removeLoadingWindow', { id: 'open-file' })
			return this.getEncoded(
				'image',
				this.extension,
				this.file.raw_content
			)
		},
		audio() {
			this.$store.commit('removeLoadingWindow', { id: 'open-file' })
			return this.getEncoded(
				'audio',
				this.extension,
				this.file.raw_content
			)
		},
		content: {
			get() {
				if (this.file) {
					return this.file.content
				}
				return undefined
			},
			set(val) {
				//this.$store.commit("setTabContent", { tab: this.tab_id, content: val });
				TabSystem.setCurrentContent(val)
			},
		},
		content_as_string: {
			get() {
				this.$store.commit('removeLoadingWindow', { id: 'open-file' })
				if (typeof this.content === 'string') return this.content
				return JSON.stringify(this.content, null, '\t')
			},
			set(val) {
				if (typeof this.content === 'string')
					TabSystem.setCurrentContent(val)
				else TabSystem.setCurrentContent(JSON.parse(val))
			},
		},
		jsonObject() {
			if (typeof this.content === 'string') {
				try {
					return cJSON.parse(this.content, undefined, true)
				} catch (e) {
					if (this.content == '') return {}
					TabSystem.setCurrentInvalid()
					this.$store.commit('removeLoadingWindow', {
						id: 'open-file',
					})
					return 'error'
				}
			}
			return this.content
		},
	},
	methods: {
		getEncoded(type, ext, data) {
			return DataUrl.convert({
				data,
				mimetype: `${type}/${ext}`,
			})
		},
		getLanguage(filePath) {
			let language = (FileType.getData(filePath) || {}).language
			if (language) return basename(language, '.js')
		},
	},
	watch: {
		content_as_string() {
			if (this.file_viewer === 'text') TabSystem.setCurrentUnsaved()
		},
	},
}
</script>

<style scoped>
.image {
	image-rendering: pixelated;
}
</style>
