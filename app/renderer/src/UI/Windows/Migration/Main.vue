<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="bridge. v2 migration"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="600"
		:height="500"
		@closeWindow="onClose"
	>
		<template #default>
			<p>
				Select a directory to store your bridge. v2 projects. This
				should not be your "com.mojang" folder
			</p>
			<v-btn color="primary" @click="chooseProjectFolder"
				>Select Folder</v-btn
			>
			<p v-if="projectPath !== undefined" class="pt-3">
				{{ projectPath }}
			</p>
			<v-divider class="my-6" />
			<p>
				Select the projects below that you want to migrate to bridge. v2
			</p>
			<div v-for="(project, i) in availableProjects" :key="`project${i}`">
				<v-checkbox
					v-model="selectedProjects"
					:label="project"
					:value="project"
				/>
			</div>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn
				@click="onConfirm"
				color="primary"
				:disabled="
					projectPath == undefined || selectedProjects.length == 0
				"
				>Confirm</v-btn
			>
		</template>
	</BaseWindow>
</template>

<script>
import { createMigrationPromptNotification } from './definition'
import BaseWindow from '../Layout/Base'
import { loadProjects } from './load'
import { ipcRenderer } from 'electron'
import LoadingWindow from '../../../../windows/LoadingWindow'
import { createV2Directory } from './create'
import { promises as fs } from 'fs'
import { createInformationWindow } from '../Common/CommonDefinitions'

export default {
	name: 'Migration',
	components: {
		BaseWindow,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow.getState()
	},
	methods: {
		onClose() {
			createMigrationPromptNotification()
			this.currentWindow.close()
		},
		onConfirm() {
			createV2Directory(this.projectPath, this.selectedProjects)
			createMigrationPromptNotification()
		},
		async chooseProjectFolder() {
			const lw = new LoadingWindow()

			const path = await ipcRenderer.invoke('openFileDialog', {
				properties: ['openDirectory'],
			})

			lw.close()

			// Ensure chosen directory is empty
			if (path[0]) {
				console.log(path)
				fs.readdir(path[0]).then(files => {
					if (files.length > 0)
						createInformationWindow(
							'Invalid directory',
							'Please select an empty directory!'
						)
					else this.projectPath = path[0]
				})
			}
		},
	},
	async mounted() {
		this.availableProjects = await loadProjects()
	},
}
</script>
