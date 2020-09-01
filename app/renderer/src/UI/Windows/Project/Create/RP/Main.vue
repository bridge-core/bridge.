<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="Create Resource Pack"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="500"
		:height="300"
		@closeWindow="close"
	>
		<template #default>
			<v-text-field v-model="RPName" label="Project Name" autofocus />
			<v-text-field
				v-model="RPDescription"
				label="Project Description"
				autofocus
				class="pb-2"
			/>
			<p>
				Resource packs are stored directly inside the
				"development_resource_packs" folder.
			</p>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn
				color="primary"
				@click="invalidNameCheck"
				:disabled="RPName == '' || RPDescription == ''"
				><span>Create!</span></v-btn
			>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '../../../Layout/Base'
import { CreateRP } from '../definition'
import fs from 'fs'
import ContentWindow from '../../../Common/Content'
import { RP_BASE_PATH, CURRENT } from '../../../../../constants'
import Vue from '../../../../../../main'
import LoadingWindow from '../../../../../../windows/LoadingWindow'
import Manifest from '../../../../../files/Manifest'
import uuidv4 from 'uuid/v4'
import CreateFiles from '../../../../../Project/CreateFiles'
import path from 'path'
import ProjectConfig from '../../../../../Project/Config'
import PackLinker from '../../../../../Utilities/LinkPacks'
import { createInformationWindow } from '../../../Common/CommonDefinitions'

export default {
	name: 'CreateRP',
	components: {
		BaseWindow,
	},
	data: () => CreateRP.getState(),
	methods: {
		close() {
			CreateRP.close()
			this.reset()
		},
		invalidNameCheck() {
			if (this.RPName.endsWith('.')) {
				createInformationWindow(
					'Invalid RP Name',
					`'${this.RPName}' ends with an invalid character '.'`
				)
			} else {
				this.createRP()
			}
		},
		createRP() {
			CreateRP.close()
			let l_w = new LoadingWindow('project.').show()
			let r_path = RP_BASE_PATH

			window.setTimeout(() => {
				fs.mkdir(r_path + this.RPName, { recursive: true }, err => {
					if (err && err.message.includes('already exists'))
						return l_w.hide()
					if (err) {
						l_w.hide()
						throw err
					}
					fs.writeFile(
						path.join(r_path, this.RPName, '/manifest.json'),
						new Manifest('resources').get(),
						async () => {
							if (err && err.message.includes('already exists'))
								return l_w.hide()
							if (err) {
								l_w.hide()
								throw err
							}

							//CREATE DEFAULT FILES
							await CreateFiles.createRPFiles(
								path.join(r_path, this.RPName),
								{
									name: this.RPName,
									description: this.RPDescription,
								}
							)
							PackLinker.link(CURRENT.PROJECT, this.RPName)
							Vue.$root.$emit('refreshExplorer')
							this.reset()
							l_w.hide()
						}
					)
				})
			}, 50)
		},
		reset() {
			this.RPName = ''
			this.RPDescription = ''
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
