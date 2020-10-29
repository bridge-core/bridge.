import { createWindow } from '../../create'
import CreateRPComponent from './RP/Main.vue'
import CreateBPComponent from './BP/Main.vue'
import { MC_BETA_VERSION, MC_STABLE_VERSION } from '../../../../constants'

export const CreateRP = createWindow(CreateRPComponent, {
	RPName: '',
	RPDescription: '',
})

export const CreateBP = createWindow(CreateBPComponent, {
	targetVersions: [],
	targetVersion: MC_STABLE_VERSION,
	projectName: '',
	projectDescription: '',
	projectNamespace: 'bridge',
	registerClientData: false,
	isFullscreen: false,
	MC_BETA_VERSION,
	MC_STABLE_VERSION,
})
