<template>
	<div>
		<v-layout align-center>
			<span style="padding: 0 4px;">
				<v-avatar tile size="36px">
					<img :src="project_icon" />
				</v-avatar>
			</span>

			<v-autocomplete
				style="margin: 4px 0; margin-right: 4px; border-radius: 0; width: calc(100% - 48px);"
				:items="search_items"
				label="Search..."
				background-color="expanded_sidebar"
				solo
				hide-details
				v-model="curr_search"
				@change="openFile"
			/>
		</v-layout>

		<v-divider />
		<file-displayer
			project="vanilla"
			:base_path="base_path"
			explorer_type="other"
			:is_immutable="true"
			@receiveFileExplorer="exp => (file_explorer = exp)"
		/>
	</div>
</template>

<script>
import FileDisplayer from './explorer/FileDisplayer.vue'
import { join } from 'path'
import fs from 'fs'
import DataUrl from 'dataurl'
import FileSystem from '../../../scripts/FileSystem'
import LoadingWindow from '../../../windows/LoadingWindow'

export default {
	name: 'vanilla-assets',
	components: {
		FileDisplayer,
	},
	data() {
		return {
			curr_search: null,
			file_explorer: null,
			base_path: __static,
			project_icon: DataUrl.convert({
				data: fs.readFileSync(join(__static, 'images/pack_icon.png')),
				mimetype: `image/png`,
			}),
		}
	},
	computed: {
		search_items() {
			return this.file_explorer
				? this.file_explorer
						.getAllFiles()
						.map(p =>
							p
								.replace(join(__static, 'vanilla/'), '')
								.replace(/\\/g, '/')
						)
				: []
		},
	},
	methods: {
		async openFile(path) {
			if (!path) return

			let lw = new LoadingWindow()

			this.curr_search = ''
			await FileSystem.open(join(__static, 'vanilla', path), true)

			lw.close()
		},
	},
}
</script>

<style scoped>
p {
	padding: 0.5em;
}
</style>
