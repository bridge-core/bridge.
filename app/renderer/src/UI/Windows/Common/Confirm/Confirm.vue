<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="Confirmation"
		:isVisible="isVisible"
		:isPersistent="true"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="440"
		:height="130"
		:hasCloseButton="false"
	>
		<template #default>
			<p class="mt-2">{{ content }}</p>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn @click="onCancel">
				<span>{{ cancelText }}</span>
			</v-btn>
			<v-btn color="primary" @click="onConfirm">
				<span>{{ confirmText }}</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '../../Layout/Base'

export default {
	name: 'Confirm',
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
	},
}
</script>

<style></style>
