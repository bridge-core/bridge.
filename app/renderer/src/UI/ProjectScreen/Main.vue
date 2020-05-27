<template>
	<v-dialog v-model="isVisible">
		<v-card color="background">
			<v-card-title>Projects</v-card-title>

			<v-card-text>
				<ProjectCard
					v-for="({ projectPath, version, name, description, author, relativeProjectPath }, i) in LoadedProjects"
					:key="projectPath"
					:style="`display: inline-block; margin-left: ${12 * (i % 4 !== 0)}px; margin-bottom: 12px; width: calc(25% - 9px);`"
					:relativeProjectPath="relativeProjectPath"
					:projectPath="projectPath"
					:projectVersion="version"
					:projectName="name"
					:projectDescription="description"
					:projectAuthor="author"
				/>
			</v-card-text>

			<!-- <v-card-actions>
				<v-spacer />

				<v-btn color="success" text @click="isVisible = false">Add project location</v-btn>
			</v-card-actions>-->
		</v-card>
	</v-dialog>
</template>

<script>
import { isVisible, LoadedProjects } from './state'
import { loadProjects } from './load'
import ProjectCard from './ProjectCard'

export default {
	name: 'ProjectScreen',
	components: {
		ProjectCard,
	},

	data: () => ({
		LoadedProjects,
	}),
	computed: {
		isVisible: {
			get() {
				return isVisible.value
			},
			set(val) {
				isVisible.value = val
			},
		},
	},

	watch: {
		isVisible(to) {
			if (to) loadProjects()
		},
	},
}
</script>

<style>
</style>