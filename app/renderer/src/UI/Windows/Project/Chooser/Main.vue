<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="Projects"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		@closeWindow="close"
	>
		<template #default>
			<div class="card-container">
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
							(i % 4 !== 0)}px; margin-bottom: 12px;`
					"
					:relativeProjectPath="relativeProjectPath"
					:projectPath="projectPath"
					:projectVersion="version"
					:projectName="name"
					:projectDescription="description"
					:projectAuthor="author"
				/>
			</div>
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
import { ProjectChooser } from './definition'
import { loadProjects } from './load'
import ProjectCard from './ProjectCard'
import BaseWindow from '../../Layout/Base'

export default {
	name: 'ProjectScreen',
	components: {
		ProjectCard,
		BaseWindow,
	},

	data: () => ProjectChooser.getState(),
	methods: {
		close: () => ProjectChooser.close(),
	},
}
</script>

<style scoped>
.card-container {
	display: grid;
	grid-template-columns: repeat(4, minmax(150px, 25%));
}
</style>
