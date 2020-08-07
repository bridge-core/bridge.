<template>
	<BaseWindow
		v-if="shouldRender"
		:windowTitle="windowTitle"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="440"
		:height="120"
		@closeWindow="onClose"
	>
		<template #default>
			<v-row>
				<v-text-field
					:label="label"
					v-model="inputValue"
				></v-text-field>
				<p class="expand_text" v-if="expandText != ''">
					{{ expandText }}
				</p>
			</v-row>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn
				color="primary"
				@click="onConfirm"
				:disabled="inputValue === ''"
			>
				<span>Confirm</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '../../Layout/Base'

export default {
	name: 'Input',
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
			this.onConfirmCb(this.inputValue)
		},
	},
}
</script>

<style>
.expand_text {
	opacity: 60%;
	padding-top: 26px;
}
</style>
