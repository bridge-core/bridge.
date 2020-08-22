<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="Color"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="350"
		:height="340"
		@closeWindow="close"
	>
		<template #default>
			<v-color-picker
				v-model="color"
				mode="hexa"
				hide-mode-switch
				flat
				class="background"
			/>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '../Layout/Base'

export default {
	name: 'ColorPicker',
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
			this.editColorCb(this.color)
		},
	},
}
</script>
