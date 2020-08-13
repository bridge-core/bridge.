<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="Link Project To Resource Pack"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="420"
		:height="180"
		@closeWindow="close"
	>
		<template #default>
			<p>
				Create a link between the currently selected behavior pack and
				one of your resource packs
			</p>
			<v-select
				v-model="selectedRP"
				:items="resourcePacks"
				solo
				placeholder="Choose a resource pack..."
			/>
		</template>
		<template #actions>
			<v-spacer />
			<v-btn
				color="primary"
				:disabled="selectedRP === null"
				@click="link"
			>
				Link!
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import { LinkRP } from './definition'
import BaseWindow from '../Layout/Base'
import fs from 'fs'
import { RP_BASE_PATH, CURRENT } from '../../../constants'
import PackLinker from '../../../Utilities/LinkPacks'

export default {
	name: 'LinkRP',
	components: {
		BaseWindow,
	},
	data: () => LinkRP.getState(),
	methods: {
		close: () => LinkRP.close(),
		link() {
			LinkRP.close()
			setTimeout(
				() => PackLinker.link(CURRENT.PROJECT, this.selectedRP),
				300
			)
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
