<template>
	<BaseWindow
		v-if="shouldRender"
		:windowTitle="windowTitle"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="440"
		:height="140"
		@closeWindow="onClose"
	>
		<template #default>
			<v-select
				autofocus
				solo
				v-model="selectedValue"
				:items="items"
				background-color="background"
				class="mt-4"
			/>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn
				color="primary"
				@click="onConfirm"
				:disabled="selectedValue === ''"
			>
				<span>Confirm</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '../../Layout/Base'

export default {
	name: 'Dropdown',
	components: {
		BaseWindow,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow.getState()
	},
	methods: {
		onClose() {
			this.currentWindow.close()
		},
		onConfirm() {
			this.currentWindow.close()
			this.onConfirmCb(this.selectedValue)
		},
	},
}
</script>
