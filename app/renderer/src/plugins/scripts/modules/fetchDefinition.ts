import { IModuleConfig } from '../types'
import FetchDefinitions from '../../../editor/FetchDefinitions'

export const FetchDefinitionModule = ({}: IModuleConfig) => ({
	fetchDefinition: (
		fileType: string,
		fetchDefs: string[],
		fetchSearch: string,
		fetchAll = false
	) =>
		FetchDefinitions.fetchSingle(
			fileType,
			fetchDefs,
			fetchSearch,
			fetchAll
		),
})
