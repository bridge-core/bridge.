<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="Go To File"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="420"
		:maxWidth="420"
		:height="160"
		:maxHeight="160"
		@closeWindow="close"
	>
		<v-autocomplete
			placeholder="Search..."
			:items="files"
			v-model.lazy="file"
			autofocus
			:menu-props="{ maxWidth: 380 }"
		/>
	</BaseWindow>
</template>

<script>
import { GoToFile } from './definition'
import BaseWindow from '../Layout/Base'
import { loadFiles } from './loadFiles'
import FileSystem from '../../../../src/FileSystem'

export default {
	name: 'GoToFile',
	props: {
		file: '',
	},
	components: {
		BaseWindow,
	},
	data: () => GoToFile.getState(),
	methods: {
		close: () => GoToFile.close(),
	},
	computed: {
		files() {
			return loadFiles()
		},
	},
	watch: {
		file() {
			if (this.file.length > 0) {
				FileSystem.open(this.file)
				GoToFile.close()
			}
		},
	},
}
</script>

<style></style>
