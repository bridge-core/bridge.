import { IModuleConfig } from '../types'
import { CURRENT } from '../../../constants'
import APP_VERSION from '../../../../../shared/app_version'
import ProjectConfig from '../../../Project/Config'

export const ContextEnv: { value: any } = { value: {} }

export const ENVModule = ({}: IModuleConfig) => ({
	APP_VERSION,
	getCurrentBP() {
		return CURRENT.PROJECT_PATH
	},
	getCurrentRP() {
		return CURRENT.RP_PATH
	},
	getProjectPrefix() {
		return ProjectConfig.getPrefixSync()
	},
	getProjectTargetVersion() {
		return CURRENT.PROJECT_TARGET_VERSION
	},
	getContext() {
		return ContextEnv.value
	},
})
