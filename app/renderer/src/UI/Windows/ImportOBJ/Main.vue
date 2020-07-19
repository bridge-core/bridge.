<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="Import OBJ"
		:isVisible="isVisible"
		:hasMaximizeButton="true"
		:isFullscreen="isFullscreen"
		:width="550"
		:maxWidth="1000"
		:height="675"
		:maxHeight="725"
		@closeWindow="close"
		@toggleFullscreen="isFullscreen = !isFullscreen"
	>
		<h3 v-if="OBJPath === ''" class="text-space">
			Please select a model to import
		</h3>
		<h3 v-if="OBJPath != ''" class="text-space">OBJ: {{ OBJPath }}</h3>
		<div class="line" />
		<br />
		<v-btn color="primary" @click="addOBJ()">Choose OBJ File</v-btn>
		<h3 v-if="TexturePath === ''" class="text-space">
			Please select a texture file for this model
		</h3>
		<h3 v-if="TexturePath != ''" class="text-space">
			Texture: {{ TexturePath }}
		</h3>
		<div class="line" />
		<br />
		<v-btn color="primary" @click="addTexture()">Choose Texture</v-btn>
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
		<div class="large-break" />
		<div class="line" />
		<v-layout class="justify-end pt-4">
			<v-btn color="primary" @click="convert">Import!</v-btn>
		</v-layout>
	</BaseWindow>
</template>

<script>
import { ImportOBJ } from './definition'
import BaseWindow from '../Layout/Base'

export default {
	name: 'ImportOBJ',
	props: {
		isFullscreen: false,
		identifier: 'unknown',
		scale: 1,
		OBJPath: '',
		TexturePath: '',
	},
	components: {
		BaseWindow,
	},

	data: () => ImportOBJ.getState(),
	methods: {
		close: () => ImportOBJ.close(),
	},
}
</script>

<style>
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
