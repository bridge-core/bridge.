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
			<div v-if="!projectsCreated">
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
					Select the projects below that you want to migrate to
					bridge. v2
				</p>
				<v-btn @click="selectAll" color="primary" v-if="!allSelected"
					>Select All</v-btn
				>
				<v-btn @click="deselectAll" color="primary" v-if="allSelected"
					>Deselect All</v-btn
				>
				<div
					v-for="(project, i) in availableProjects"
					:key="`project${i}`"
				>
					<v-checkbox
						v-model="selectedProjects"
						:label="project"
						:value="project"
					/>
				</div>
			</div>
			<div v-if="projectsCreated">
				<p>
					The projects that you have selected have now been converted
					to the bridge. v2 format and copied to
					<strong>"{{ projectPath }}"</strong>.
				</p>
				<p>
					Now you need to launch bridge. v2 and during step 1 of the
					setup process, select the bridge. v2 directory above that
					has just been created.
				</p>
				<p>
					If you have already been through the bridge. v2 setup
					process and have already selected a different directory, you
					can change it by navigating to the "General" tab of the
					settings window and selecting the "Select Root Folder"
					option at the bottom. The settings window can be found in
					the toolbar under "File > Preferences > Settings" or
					accessed via the "Ctrl + ," shortcut.
				</p>
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
				v-if="!projectsCreated"
				>Confirm</v-btn
			>
			<v-btn color="primary" @click="showProjects" v-if="projectsCreated"
				>View Projects</v-btn
			>
			<v-btn color="primary" @click="goToV2" v-if="projectsCreated"
				>Go!</v-btn
			>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '../Layout/Base'
import { loadProjects } from './load'
import { ipcRenderer, shell } from 'electron'
import LoadingWindow from '../../../../windows/LoadingWindow'
import { createV2Directory } from './create'
import { promises as fs } from 'fs'
import { join } from 'path'

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
			this.projectsCreated = false
			this.currentWindow.close()
		},
		async onConfirm() {
			const lw = new LoadingWindow()
			await createV2Directory(
				this.projectPath,
				this.selectedProjects
			)
			lw.close()

			this.projectsCreated = true
		},
		goToV2() {
			shell.openExternal('https://editor.bridge-core.app')
			this.currentWindow.close()
		},
		showProjects() {
			shell.showItemInFolder(join(this.projectPath, 'projects'))
		},
		selectAll() {
			this.selectedProjects = this.availableProjects
		},
		deselectAll() {
			this.selectedProjects = []
		},
		async chooseProjectFolder() {
			const lw = new LoadingWindow()

			const path = await ipcRenderer.invoke('openFileDialog', {
				properties: ['openDirectory'],
			})

			lw.close()

			if (path[0]) {
				this.projectPath = path[0]
			}
		},
	},
	async mounted() {
		this.availableProjects = await loadProjects()
	},
	computed: {
		allSelected() {
			return this.selectedProjects == this.availableProjects
		},
	},
}
</script>
