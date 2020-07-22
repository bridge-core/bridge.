<template>
	<BaseWindow
		v-if="shouldRender"
		:windowTitle="windowTitle"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="440"
		:height="120"
		:hasCloseButton="false"
	>
		<template #default>
			<p>{{ content }}</p>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn color="primary" @click="close"><span>Okay</span></v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '../Layout/Base'

export default {
	name: 'Information',
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
	},
}
</script>

<style></style>
