<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="Create File Here"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="420"
		:height="140"
		@closeWindow="onClose"
	>
		<template #default>
			<v-row>
				<v-text-field
					label="File Name"
					v-model="fileName"
					class="text-field"
				/>
				<v-select
					:items="fileExtensions"
					autofocus
					v-model="fileExtension"
					solo
					class="select"
				/>
			</v-row>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn @click="onClose"><span>Cancel</span></v-btn>
			<v-btn color="primary" @click="onCreate" :disabled="fileName == ''"
				><span>Create</span></v-btn
			>
		</template>
	</BaseWindow>
</template>

<script>
import { CreateFileHere } from './definition'
import BaseWindow from '../../Layout/Base'
import { createFile } from './CreateFile'

export default {
	name: 'CreateFileHere',
	components: {
		BaseWindow,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow.getState()
	},
	methods: {
		onClose() {
			this.currentWindow.close()
		},
		onCreate() {
			this.currentWindow.close()
			createFile(
				this.fileName,
				this.folderPath,
				this.fileExtension,
				this.fileExplorer
			)
		},
	},
}
</script>

<style>
.select {
	width: 25%;
}
.text-field {
	width: 72%;
	padding-right: 3%;
}
</style>
