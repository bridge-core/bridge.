import { createWindow } from '../../create'
import ProjectChooserComponent from './Main.vue'

export const ProjectChooser = createWindow(ProjectChooserComponent, {
	LoadedProjects: [],
})

export const LoadedProjects = <unknown[]>(
	ProjectChooser.getState().LoadedProjects
)
