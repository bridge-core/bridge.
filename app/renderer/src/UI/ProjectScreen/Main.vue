<template>
	<BaseWindow
		windowTitle="Projects"
		:isVisible="isVisible.value"
		:hasMaximizeButton="false"
		@closeWindow="isVisible.value = false"
	>
		<template #default>
			<ProjectCard
				v-for="({
					projectPath,
					version,
					name,
					description,
					author,
					relativeProjectPath,
				},
				i) in LoadedProjects"
				:key="projectPath"
				:style="
					`display: inline-block; margin-left: ${12 *
						(i % 4 !==
							0)}px; margin-bottom: 12px; width: calc(25% - 9px);`
				"
				:relativeProjectPath="relativeProjectPath"
				:projectPath="projectPath"
				:projectVersion="version"
				:projectName="name"
				:projectDescription="description"
				:projectAuthor="author"
			/>
		</template>

		<!-- <template #actions>
			<v-spacer />

			<v-btn color="success" text @click="isVisible.value = false"
				>Add project location</v-btn
			>
		</template> -->
	</BaseWindow>
</template>

<script>
import { isVisible, LoadedProjects } from './state'
import { loadProjects } from './load'
import ProjectCard from './ProjectCard'
import BaseWindow from '../Windows/Layout/Base'

export default {
	name: 'ProjectScreen',
	components: {
		ProjectCard,
		BaseWindow,
	},

	data: () => ({
		isVisible,
		LoadedProjects,
	}),
}
</script>

<style></style>
