<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="Update Avaliable!"
		:isVisible="isVisible"
		:hasMaximizeButton="true"
		:isFullscreen="isFullscreen"
		:width="450"
		:height="475"
		:maxHeight="550"
		@closeWindow="close"
		@toggleFullscreen="isFullscreen = !isFullscreen"
	>
		<template #default>
			<h2>{{ latestVersionName }}</h2>
			<br />
			<v-img :src="imgSrc" />
			<br />
			<div v-if="!downloadAvailable">
				<p>
					We are still in the process of rolling out the update. It
					will be available shortly. <a @click="refresh">Refresh!</a>
				</p>
				<br />
			</div>
			<p v-html="updateDesc" />
			<br />
			<p class="downloads">Downloads: {{ downloads }}</p>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn @click="close"><span>Later</span></v-btn>
			<v-btn
				color="primary"
				@click="download"
				:disabled="!downloadAvailable"
				><v-icon>mdi-download</v-icon><span>Download!</span></v-btn
			>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '../Layout/Base'
import { updateApp } from '../../../Utilities/updateApp'
import { createAppUpdateNotification } from '../../../AppCycle/startUp'

export default {
	name: 'UpdateApp',
	components: {
		BaseWindow,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow.getState()
	},
	methods: {
		close() {
			this.currentWindow.close()
		},
		download() {
			this.currentWindow.close()
			updateApp(this.urls)
		},
		refresh() {
			this.currentWindow.close()
			this.notification.dispose()
			createAppUpdateNotification()
		},
	},
}
</script>

<style scoped>
.downloads {
	opacity: 75%;
}
</style>
