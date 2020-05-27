import { IModuleConfig } from '../types'
import { CURRENT } from '../../../constants'
import APP_VERSION from '../../../../../shared/app_version'

export const ENVModule = ({}: IModuleConfig) => ({
	APP_VERSION,
	getCurrentBP() {
		return CURRENT.PROJECT_PATH
	},
	getCurrentRP() {
		return CURRENT.RP_PATH
	},
})
