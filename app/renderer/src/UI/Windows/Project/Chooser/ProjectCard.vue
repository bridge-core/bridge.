<template>
	<v-card @click="selectProject" color="menu" style="height: 500px">
		<v-img
			height="240"
			style="image-rendering: pixelated;"
			draggable="false"
			:src="this.projectImage"
		/>

		<v-card-title>{{ projectName }}</v-card-title>

		<v-card-text>
			<div class="my-4 subtitle-1">
				by {{ projectAuthor }} • v{{
					(projectVersion || [1, 0, 0]).join('.')
				}}
			</div>

			<div class="text-wrap">{{ projectDescription }}</div>
		</v-card-text>

		<!-- <v-divider class="mx-4"></v-divider>

		<v-card-title>Tasks</v-card-title>

		<v-card-text>TASKS HERE</v-card-text>-->
	</v-card>
</template>

<script>
import { promises as fs } from 'fs'
import { join, basename } from 'path'
import EventBus from '../../../../EventBus'
import { ProjectChooser } from './definition'

export default {
	name: 'ProjectCard',
	props: {
		projectPath: String,
		// projectName: String,
		projectDescription: String,
		projectVersion: Array,
		projectAuthor: String,
		relativeProjectPath: String,
	},
	async created() {
		try {
			await fs.readFile(join(this.projectPath, 'pack_icon.png'))
			this.projectImage = join(this.projectPath, 'pack_icon.png')
		} catch {}
	},
	data: () => ({
		projectImage: join(__static, 'images/pack_icon.png'),
	}),

	computed: {
		projectName() {
			return basename(this.projectPath)
		},
	},
	methods: {
		selectProject() {
			ProjectChooser.close()
			EventBus.trigger('bridge:selectProject', this.relativeProjectPath)
		},
	},
}
</script>

<style scoped></style>
