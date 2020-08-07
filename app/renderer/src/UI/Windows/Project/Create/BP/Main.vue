<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="Create Project"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="500"
		:height="400"
		@closeWindow="close"
	>
		<template #default>
			<v-text-field
				v-model="projectName"
				label="Project Name"
				autofocus
			/>
			<v-text-field
				v-model="projectDescription"
				label="Project Description"
				autofocus
				class="pb-2"
			/>
			<p>
				Projects are stored directly inside the
				"development_behavior_packs" folder.
			</p>
			<div class="line" />
			<v-select
				background-color="background"
				v-model="targetVersion"
				:items="targetVersions"
				solo
				placeholder="Target Minecraft Version"
				class="py-2"
			/>
			<v-switch
				v-model="registerClientData"
				label="Register Client Data"
			></v-switch>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn
				color="primary"
				@click="createProject"
				:disabled="
					projectName == '' ||
						projectDescription == '' ||
						targetVersion == ''
				"
				><span>Create!</span></v-btn
			>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '../../../Layout/Base'
import { CreateBP } from '../definition'
import fs from 'fs'
import ContentWindow from '../../../Common/Content'
import { BASE_PATH } from '../../../../../constants'
import Vue from '../../../../../../main'
import LoadingWindow from '../../../../../../windows/LoadingWindow'
import Manifest from '../../../../../files/Manifest'
import uuidv4 from 'uuid/v4'
import CreateFiles from '../../../../../Project/CreateFiles'
import path from 'path'
import EventBus from '../../../../../EventBus'
import ProjectConfig from '../../../../../Project/Config'
import { getFormatVersions } from '../../../../../autoCompletions/components/VersionedTemplate/Common'

export default {
	name: 'CreateBP',
	components: {
		BaseWindow,
	},
	data: () => CreateBP.getState(),
	methods: {
		close() {
			CreateBP.close(), this.reset()
		},
		createProject() {
			CreateBP.close()
			let l_w = new LoadingWindow('project.').show()
			let b_path = BASE_PATH

			window.setTimeout(() => {
				fs.mkdir(
					b_path + this.projectName,
					{ recursive: true },
					err => {
						if (err && err.message.includes('already exists'))
							return l_w.hide()
						if (err) {
							l_w.hide()
							throw err
						}
						fs.writeFile(
							path.join(
								b_path,
								this.projectName,
								'/manifest.json'
							),
							new Manifest('data', this.registerClientData).get(),
							async () => {
								if (
									err &&
									err.message.includes('already exists')
								)
									return l_w.hide()
								if (err) {
									l_w.hide()
									throw err
								}

								//CREATE DEFAULT FILES
								await CreateFiles.createBPFiles(
									path.join(b_path, this.projectName),
									{
										name: this.projectName,
										description: this.projectDescription,
									}
								)

								Vue.$root.$emit('refreshExplorer')
								ProjectConfig.setFormatVersion(
									this.targetVersion
								)
								l_w.hide()
								EventBus.trigger(
									'bridge:selectProject',
									this.projectName
								)
							}
						)
					}
				)
			}, 50)
			//this.reset()
		},
		reset() {
			;(this.projectName = ''), (this.projectDescription = '')
			this.targetVersion = ''
		},
	},
}
</script>

<style>
.line {
	background: grey;
	width: 100%;
	height: 1px;
}
</style>
