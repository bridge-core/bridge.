<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="Link Project To Resource Pack"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="420"
		:maxWidth="420"
		:height="160"
		:maxHeight="160"
		@closeWindow="close"
	>
		<template #default>
			<p>
				Create a link between the currently selected behavior pack and
				one of your resource packs
			</p>
			<v-select :items="resourcePacks" v-model="selectedRP" />
		</template>
		<template #actions>
			<v-layout class="justify-end">
				<v-btn color="primary" @click="link"><span>Link!</span></v-btn>
			</v-layout>
		</template>
	</BaseWindow>
</template>

<script>
import { LinkRP } from './definition'
import BaseWindow from '../Layout/Base'
import fs from 'fs'
import { RP_BASE_PATH } from '../../../constants'
import PackLinker from '../../../Utilities/LinkPacks'
import InformationWindow from '../Common/Information'

export default {
	name: 'LinkRP',
	components: {
		BaseWindow,
	},
	data: () => LinkRP.getState(),
	props: {
		selectedRP: '',
	},
	methods: {
		close: () => LinkRP.close(),
		link(selected_rp) {
			if (this.selectedRP != undefined) {
				const bp_name = this.$store.state.Explorer.project.explorer
				LinkRP.close()
				setTimeout(() => PackLinker.link(bp_name, this.selectedRP), 300)
			} else {
				new InformationWindow(
					'No RP selected',
					'Please select a resource pack before trying to link'
				)
			}
		},
	},
	computed: {
		resourcePacks() {
			const PROJECTS = fs
				.readdirSync(RP_BASE_PATH, {
					withFileTypes: true,
				})
				.filter(dirent => dirent.isDirectory())
				.map(dirent => dirent.name)
			return PROJECTS
		},
	},
}
</script>

<style></style>
