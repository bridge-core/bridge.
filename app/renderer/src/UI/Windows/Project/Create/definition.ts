import { createWindow } from '../../create'
import CreateRPComponent from './RP/Main.vue'
import CreateBPComponent from './BP/Main.vue'

export const CreateRP = createWindow(CreateRPComponent, {
	RPName: '',
	RPDescription: '',
})

export const CreateBP = createWindow(CreateBPComponent, {
	targetVersions: [],
	targetVersion: '',
	projectName: '',
	projectDescription: '',
	projectNamespace: 'bridge',
	registerClientData: false,
})
