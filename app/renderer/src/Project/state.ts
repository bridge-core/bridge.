/**
 * Reactive vue state for projects
 */

import Vue from 'vue'
import { AnvilManifest } from './Manifest/types'

export interface IProjectData {
	name: string
	description: string
	loadPath: string
	modules?: Partial<AnvilManifest.IModules>
}

interface IProjectState {
	namespace: string
	currentProject: null | IProjectData
	projects: null | IProjectData[]
}

export const ProjectState: IProjectState = Vue.observable({
	namespace: 'anvil',
	currentProject: null,
	projects: null,
})
