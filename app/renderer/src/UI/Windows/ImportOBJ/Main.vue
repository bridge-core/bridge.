<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="Import OBJ"
		:isVisible="isVisible"
		:hasMaximizeButton="true"
		:isFullscreen="isFullscreen"
		:percentageHeight="85"
		:percentageWidth="40"
		:maxPercentageHeight="95"
		:maxPercentageWidth="90"
		@closeWindow="close"
		@toggleFullscreen="isFullscreen = !isFullscreen"
	>
		<template #default>
			<h3 v-if="OBJPath === null" class="text-space">
				Please select a model to import
			</h3>
			<h3 v-if="OBJPath != null" class="text-space">
				OBJ: {{ OBJPath }}
			</h3>
			<div class="line" />
			<br />
			<v-btn color="primary" @click="chooseOBJ">Choose OBJ File</v-btn>
			<h3 v-if="texturePath === null" class="text-space">
				Please select a texture file for this model
			</h3>
			<h3 v-if="texturePath != null" class="text-space">
				Texture: {{ texturePath }}
			</h3>
			<div class="line" />
			<br />
			<v-btn color="primary" @click="chooseTexture">Choose Texture</v-btn>
			<div class="large-break" />
			<v-text-field
				label="Model Identifier"
				placeholder="unknown"
				v-model="identifier"
			></v-text-field>
			<div class="large-break" />
			<v-slider
				thumb-label
				v-model="scale"
				min="0.1"
				max="10"
				label="Model Scale"
				step="0.1"
			></v-slider>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn
				color="primary"
				@click="convert"
				:disabled="
					identifier === '' ||
						OBJPath === null ||
						texturePath === null
				"
				>Import!</v-btn
			>
		</template>
	</BaseWindow>
</template>

<script>
import { ImportOBJ } from './definition'
import BaseWindow from '../Layout/Base'
import { ipcRenderer } from 'electron'
import LoadingWindow from '../../../../windows/LoadingWindow'
import { uuid } from '../../../Utilities/useAttr'
import { OBJtoMC } from '../../../Compiler/File/Model/OBJtoMC'
import { promises as fs } from 'fs'
import { CURRENT } from '../../../constants'
import { trySetRP, NEGATIVE_RESPONSES } from '../../../Utilities/FindRP'
import { join } from 'path'
import { createInformationWindow } from '../../../UI/Windows/Common/CommonDefinitions'

export default {
	name: 'ImportOBJ',
	components: {
		BaseWindow,
	},

	data: () => ImportOBJ.getState(),
	methods: {
		close() {
			ImportOBJ.close()
			this.reset()
		},
		async chooseOBJ() {
			const lw = new LoadingWindow()
			const files = await ipcRenderer.invoke('openFileDialog', {
				filters: [{ name: '3D Model', extensions: ['obj'] }],
			})
			if (files.length > 0) this.OBJPath = files[0]

			lw.close()
		},
		async chooseTexture() {
			const lw = new LoadingWindow()
			const files = await ipcRenderer.invoke('openFileDialog', {
				filters: [
					{
						name: 'Texture',
						extensions: ['png', 'jpeg', 'jpg'],
					},
				],
			})
			if (files.length > 0) this.texturePath = files[0]

			lw.close()
		},
		async convert() {
			ImportOBJ.close()
			const lw = new LoadingWindow()

			let rpSet = true
			if (
				!CURRENT.RESOURCE_PACK ||
				NEGATIVE_RESPONSES.includes(CURRENT.RESOURCE_PACK)
			)
				rpSet = await trySetRP()
			if (!rpSet) {
				lw.close()
				this.reset()
				return createInformationWindow(
					'ERROR',
					'You do not have a resource pack to add the model to.'
				)
			}

			const model = await OBJtoMC(
				this.OBJPath,
				this.texturePath,
				`geometry.${this.identifier}`,
				this.scale
			)

			await fs.mkdir(join(CURRENT.RP_PATH, 'models/entity'), {
				recursive: true,
			})
			await fs.writeFile(
				join(
					CURRENT.RP_PATH,
					'models/entity',
					this.identifier + '.json'
				),
				JSON.stringify(model, null, '\t')
			)

			lw.close()
			this.reset()
		},
		reset() {
			this.identifier = 'unknown'
			this.scale = 1
			this.OBJPath = null
			this.texturePath = null
		},
	},
}
</script>

<style scoped>
.text-space {
	padding-top: 24px;
	padding-bottom: 24px;
}
.line {
	width: 100%;
	height: 1px;
	background: grey;
}
.large-break {
	height: 60px;
}
</style>
