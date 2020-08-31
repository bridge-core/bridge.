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
			@input="openFile"
			autofocus
			:menu-props="{ maxWidth: 380 }"
		/>
	</BaseWindow>
</template>

<script>
import { GoToFile } from './definition'
import BaseWindow from '../../Layout/Base'
import { loadFiles } from './loadFiles'
import FileSystem from '../../../../FileSystem'

export default {
	name: 'GoToFile',
	components: {
		BaseWindow,
	},
	data: () => GoToFile.getState(),
	computed: {
		files() {
			return loadFiles()
		},
	},

	methods: {
		close: () => GoToFile.close(),
		openFile(filePath) {
			FileSystem.open(filePath)
			GoToFile.close()
		},
	},
}
</script>

<style></style>
