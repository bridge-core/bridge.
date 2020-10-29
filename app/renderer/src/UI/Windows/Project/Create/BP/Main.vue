<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="Create Project"
		:isVisible="isVisible"
		:hasMaximizeButton="true"
		:isFullscreen="isFullscreen"
		:percentageHeight="65"
		:percentageWidth="40"
		:maxPercentageHeight="75"
		:maxPercentageWidth="90"
		@closeWindow="onClose"
		@toggleFullscreen="isFullscreen = !isFullscreen"
	>
		<template #default>
			<div class="d-flex">
				<v-text-field
					v-model="projectName"
					label="Project Name"
					autofocus
					hide-details
					class="mr-3"
				/>
				<v-text-field
					v-model="projectNamespace"
					label="Project Namespace"
					autofocus
					hide-details
					class="ml-3"
				/>
			</div>

			<v-text-field
				v-model="projectDescription"
				label="Project Description"
				autofocus
				hide-details
				class="mt-4"
			/>

			<p class="mt-10">
				The target Minecraft version should be set to what version you
				are developing for. Currently <strong>1.16.0</strong> is the
				stable release and <strong>1.16.100</strong> is the beta
				release.
			</p>
			<v-select
				background-color="background"
				v-model="targetVersion"
				:items="targetVersions"
				solo
				hide-details
				placeholder="Target Minecraft Version"
				class="py-2"
			/>
			<div class="line mt-4" />
			<p class="pt-2">
				Client Data must be toggled if you want to use client scripts
				with the experimental scripting API.
			</p>
			<v-switch
				v-model="registerClientData"
				label="Register Client Data"
			/>
			<div class="line mt-4" />
			<p class="pt-2">
				Projects are stored directly inside the
				"development_behavior_packs" folder.
			</p>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn
				color="primary"
				@click="invalidNameCheck"
				:disabled="
					projectName == '' ||
						projectDescription == '' ||
						targetVersion == '' ||
						projectNamespace == ''
				"
			>
				<span>Create!</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '../../../Layout/Base'
import { CreateBP } from '../definition'
import { promises as fs } from 'fs'
import ContentWindow from '../../../Common/Content'
import { BASE_PATH } from '../../../../../constants'
import Vue from '../../../../../../main'
import LoadingWindow from '../../../../../../windows/LoadingWindow'
import Manifest from '../../../../../files/Manifest'
import uuidv4 from 'uuid/v4'
import CreateFiles from '../../../../../Project/CreateFiles'
import path from 'path'
import { once, trigger } from '../../../../../AppCycle/EventSystem'
import ProjectConfig from '../../../../../Project/Config'
import { getFormatVersions } from '../../../../../autoCompletions/components/VersionedTemplate/Common'
import { createInformationWindow } from '../../../Common/CommonDefinitions'
import { createErrorNotification } from '../../../../../AppCycle/Errors'
import { writeJSON } from '../../../../../Utilities/JsonFS'

export default {
	name: 'CreateBP',
	components: {
		BaseWindow,
	},
	data: () => CreateBP.getState(),
	methods: {
		onClose() {
			CreateBP.close()
			this.reset()
		},
		invalidNameCheck() {
			if (this.projectName.endsWith('.')) {
				createInformationWindow(
					'Invalid Project Name',
					`'${this.projectName}' ends with an invalid character '.'`
				)
			} else {
				this.createProject()
			}
		},
		async createProject() {
			CreateBP.close()
			let lW = new LoadingWindow('project.').show()

			try {
				await fs.mkdir(
					path.join(BASE_PATH, this.projectName, 'bridge'),
					{
						recursive: true,
					}
				)
			} catch (err) {
				if (err && err.message.includes('already exists')) {
					return lW.hide()
				} else if (err) {
					lW.hide()
					createErrorNotification(err)
				}
			}

			await fs.writeFile(
				path.join(BASE_PATH, this.projectName, '/manifest.json'),
				new Manifest(
					'data',
					this.registerClientData,
					undefined,
					this.targetVersion
				).get()
			)

			//Create config file
			await writeJSON(
				path.join(BASE_PATH, this.projectName, 'bridge/config.json'),
				{
					prefix: this.projectNamespace,
					formatVersion: this.targetVersion,
				}
			)

			//Create default files
			await CreateFiles.createBPFiles(
				path.join(BASE_PATH, this.projectName),
				{
					name: this.projectName,
					description: this.projectDescription,
					projectTargetVersion: this.targetVersion,
				}
			)

			trigger('bridge:selectProject', this.projectName)

			lW.hide()
			this.reset()
		},
		reset() {
			this.projectName = ''
			this.projectDescription = ''
			this.targetVersion = ''
			this.projectNamespace = ''
		},
	},
	watch: {
		isVisible() {
			if (this.isVisible)
				this.targetVersions = getFormatVersions().reverse()
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
