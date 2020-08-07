import { createWindow } from '../../create'
import CreateRPComponent from './RP/Main.vue'
import CreateBPComponent from './BP/Main.vue'
import { getFormatVersions } from '../../../../autoCompletions/components/VersionedTemplate/Common'

export const CreateRP = createWindow(CreateRPComponent, {
	RPName: '',
	RPDescription: '',
})

export const CreateBP = createWindow(CreateBPComponent, {
	targetVersions: getFormatVersions().reverse(),
	targetVersion: '',
	projectName: '',
	projectDescription: '',
	registerClientData: false,
})
