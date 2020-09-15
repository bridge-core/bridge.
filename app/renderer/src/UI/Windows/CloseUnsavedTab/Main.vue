<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="Confirmation"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="440"
		:height="130"
		@closeWindow="onClose"
	>
		<template #default>
			<p class="mt-2">
				This tab has unsaved progress! Are you sure that you want to
				close it?
			</p>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn @click="onCancel"><span>Cancel</span></v-btn>
			<v-btn color="success" @click="onConfirm"><span>Save</span></v-btn>
			<v-btn color="error" @click="onClose"><span>Close</span></v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '../Layout/Base'

export default {
	name: 'CloseUnsavedTab',
	components: {
		BaseWindow,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow.getState()
	},
	methods: {
		onCancel() {
			this.currentWindow.close()
			this.onCancelCb()
		},
		onConfirm() {
			this.currentWindow.close()
			this.onConfirmCb()
		},
		onClose() {
			this.currentWindow.close()
			this.onCancelCb()
		},
	},
}
</script>

<style></style>
